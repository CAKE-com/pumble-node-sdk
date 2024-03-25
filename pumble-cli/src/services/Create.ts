import prompts, { PromptObject } from 'prompts';
import { promises as fs } from 'fs';
import path from 'path';
import childProcess from 'child_process';
const TEMPLATE_PATH = '../../template';
export type ReplacementsDict = {
    name: string;
    displayName: string;
    botTitle: string;
    bot: string;
    botScopes: string;
    userScopes: string;
    globalShortcuts: string;
    messageShortcuts: string;
    slashCommands: string;
    events: string;
    eventsPath: string;
    redirect: string;
};
class Create {
    private defaultReplacements: ReplacementsDict = {
        name: 'name',
        displayName: 'Display Name',
        botTitle: 'Bot Title',
        bot: `true`,
        botScopes: `["messages:read", "messages:write"]`,
        userScopes: `["messages:read"]`,
        globalShortcuts: `
[
    {
      name: "Global shortcut",
      handler: async (ctx) => {
        await ctx.ack();
        console.log("Received global shortcut!");
        await ctx.say("Received global shortcut!");
      },
    },
  ]
            `,
        messageShortcuts: `
[
    {
      name: "Message shortcut",
      handler: async (ctx) => {
        await ctx.ack();
        console.log("Received message shortcut!");
        await ctx.say("Ok", "in_channel", true);
      },
    },
  ]
            `,
        slashCommands: `
[
    {
      command: "/slash_first",
      handler: async (ctx) => {
        await ctx.ack();
        console.log("Received slash command!");
        await ctx.say("Received slash command!");
      },
    },
  ]
            `,
        events: `
[
    {
      name: "NEW_MESSAGE",
      handler: (ctx) => {
        console.log("Received new message!", ctx.payload.body);
      },
    },
  ]
            `,
        eventsPath: '/hook',
        redirect: `{enable: true, path: "/redirect"}`,
    };
    async getBasicData(): Promise<{
        name: string;
        botTitle: string;
        displayName: string;
    }> {
        const questions: PromptObject[] = [
            {
                name: 'name',
                type: 'text',
                message: 'What is the name of your App',
            },
            {
                name: 'description',
                type: 'text',
                message: 'Description',
            },
        ];
        const result = await prompts(questions);
        const normalizedName = (result.name as string).toLowerCase().replace(/\s+/gs, '-');
        return {
            name: normalizedName,
            botTitle: result.description,
            displayName: result.name,
        };
    }

    async copyRecursive(basicData: ReplacementsDict, dirname: string, subdir?: string) {
        await fs.mkdir(!subdir ? dirname : path.join(dirname, subdir));
        const files = await fs.readdir(
            !subdir ? path.join(__dirname, TEMPLATE_PATH) : path.join(__dirname, TEMPLATE_PATH, subdir)
        );
        for (const item of files) {
            const fullFileName = path.join(__dirname, TEMPLATE_PATH, !subdir ? item : path.join(subdir, item));
            const newFileName = path.join(!subdir ? dirname : path.join(dirname, subdir), item.replace(/^\_/, ''));
            const stats = await fs.stat(fullFileName);
            if (stats.isFile()) {
                let fileContent = (await fs.readFile(fullFileName)).toString();
                for (const [key, value] of Object.entries(basicData)) {
                    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
                    fileContent = fileContent.replace(regex, value);
                }
                await fs.writeFile(newFileName, fileContent);
            } else {
                await this.copyRecursive(basicData, dirname, item);
            }
        }
    }

    async main(overrides?: { name: string } & Partial<ReplacementsDict>) {
        if (!overrides) {
            overrides = await this.getBasicData();
        }
        const dirname = overrides.name;
        await this.copyRecursive({ ...this.defaultReplacements, ...overrides }, dirname);
        console.log('Installing packages...');
        const pr = childProcess.spawn('npm', ['install'], {
            env: { ...process.env },
            stdio: ['pipe', 'pipe', 'pipe'],
            cwd: dirname,
        });
        pr.stdout?.pipe(process.stdout);
        pr.stderr?.pipe(process.stderr);
        pr.on('exit', () => {
            console.log(`Next steps:\n\ncd ${dirname}\nnpm run dev`);
        });
    }
}

export const createAddon = (overrides?: ReplacementsDict) => new Create().main(overrides);
