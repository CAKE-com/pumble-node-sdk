import {Express} from 'express';
import * as fs from "node:fs";
import {repository} from "../persistence/PollRepository";
import path from "path";
import {pumbleApiService} from "../service/PumbleApiService";
import {ApiClient, V1} from "pumble-sdk";
import WorkspaceUser = V1.WorkspaceUser;
import {formatDate, getQuestionParts} from "../service/utils";
import * as Mustache from "mustache";
import {decrypt} from "../service/EncryptionService";
import {RESULTS_PAGE_EXPIRY_DELAY} from "../config";
import {Poll} from "../domain/Poll";
import {simpleExpiringSet} from "../service/SimpleExpiringSet";
import { Logger } from '../service/Logger';

const errorHtmlPage = fs.readFileSync('static/results-expired.html').toString('utf-8');
const resultsPage = fs.readFileSync('static/results.html').toString('utf-8');

const logger = Logger.getInstance('httpAdapter');

const setupEndpoints = (app: Express) => {
    app.get('/health', (req, res) => {
        res.send('Ok');
    });

    app.get('/icon', (req, res) => {
        let type = req.query.type!.toString();

        switch (type) {
            case 'logoLight' : {
                res.sendFile(path.join(__dirname, './../../static/logo-pumble-light.svg'));
                return;
            }
            case 'logoDark' : {
                res.sendFile(path.join(__dirname, './../../static/logo-pumble-dark.svg'));
                return;
            }
            case 'arrowDark' : {
                res.sendFile(path.join(__dirname, './../../static/arrow-dark.svg'));
                return;
            }
            case 'arrowLight' : {
                res.sendFile(path.join(__dirname, './../../static/arrow-light.svg'));
                return;
            }
            case 'arrowDownDark' : {
                res.sendFile(path.join(__dirname, './../../static/arrow-down-dark.svg'));
                return;
            }
            case 'arrowDownLight' : {
                res.sendFile(path.join(__dirname, './../../static/arrow-down-light.svg'));
                return;
            }
        }

    });

    app.get('/results/:id', async (req, res) => {
        const encryptedId = req.params.id;
        const token = req.query?.token as string;

        if (!encryptedId) { // || !simpleExpiringSet.has(token)) {
            return res.send(errorHtmlPage).end();
        }
        let poll;

        try {
            let pollId = decrypt(encryptedId);
            poll = await repository.getById(pollId.toString());
        } catch (e) {
            logger.error('error when trying to load poll with encryptedId = ', encryptedId);
            return res.send(errorHtmlPage).end();
        }

        if (!poll) {
            return res.send(errorHtmlPage).end();
        }

        let closeDate = new Date(poll.endsAt);
        let currentDate = new Date();
        currentDate.setUTCDate(currentDate.getUTCDate() - RESULTS_PAGE_EXPIRY_DELAY);

        if (closeDate.getTime() < currentDate.getTime()) {
            return res.send(errorHtmlPage).end();
        }


        const botClient = await pumbleApiService.getBotClient(poll.workspaceId);
        const userClient = await pumbleApiService.getUserClient(poll.workspaceId, poll.userId);
        const users = await botClient!.v1.users.listWorkspaceUsers();

        const answerMap = new Map<string, any>();
        const userMap = new Map<string, WorkspaceUser>();

        for (let user of users) {
            userMap.set(user.id, user);
        }

        const answers = poll.answers.map((answer, index) => {
            const answerObject = {
                text: answer,
                index: index + 1,
                voters: [],
                voteCount: '0 votes',
                topAnswer: false
            };
            answerMap.set(answer, answerObject);
            return answerObject;
        });


        for (let voter of poll.voters) {
            for (let selection of voter.selections) {
                let user = userMap.get(voter.userId)!;
                answerMap.get(selection)!.voters.push({
                    name: user.name,
                    avatar: `<img width="20px" height="20px" src="${user.avatar.scaledPath}" alt="">`
                });
            }
        }

        // Sort voters for each answer group
        for (let answerObject of answerMap.values()) {
            answerObject.voters.sort((a: any, b: any) => a.name.localeCompare(b.name));
        }

        let maxVoteCount = 0;
        let secondTopVoteCount = 0;

        answers.map(answer => {
            if (answer.voters.length > maxVoteCount) {
                maxVoteCount = answer.voters.length;
            } else if (answer.voters.length > secondTopVoteCount) {
                secondTopVoteCount = answer.voters.length;
            }
        });

        let hasMultipleTopOptions = maxVoteCount == secondTopVoteCount;

        answers.map(answer => {
            answer.voteCount = answer.voters.length == 1 ? '1 vote' : `${answer.voters.length} votes`;
            answer.topAnswer = !hasMultipleTopOptions && answer.voters.length == maxVoteCount;
        });

        const model = {
            question: await formatQuestionText(poll, botClient!, userClient),
            answers: answers,
            creator: userMap.get(poll.userId)?.name,
            dateTimeEnds: poll.endsAtString,
            pollState: poll.closed ? "Closed" : "Closes",
        }

        res.send(Mustache.render(resultsPage, model)).end();

    });

};

async function formatQuestionText(poll: Poll, botClient: ApiClient, userClient?: ApiClient) {
    let questionParts = getQuestionParts(poll.question);
    let processedText = questionParts.text;

    if (questionParts.userIds.length >= 1) {
        const workspaceUsers = await botClient.v1.users.listWorkspaceUsers();
        workspaceUsers.filter(u => questionParts.userIds.includes(u.id))
            .forEach(u => processedText = processedText.replace(u.id, `@${u.name}`));
    }
    if (questionParts.channelIds.length >= 1) {
        const channels = await userClient!.v1.channels.listChannels();
        channels.filter(ch => questionParts.channelIds.includes(ch.channel.id))
            .forEach(ch => processedText = processedText.replace(ch.channel.id, `#${ch.channel.name}`));
    }
    if (questionParts.groupIds.length >= 1) {
        const groups = await botClient.v1.users.listUserGroups();
        groups.filter(group => questionParts.groupIds.includes(group.id))
            .forEach(group => processedText = processedText.replace(group.id, `@${group.handle}`));
    }

    return processedText;
}

export default setupEndpoints;
