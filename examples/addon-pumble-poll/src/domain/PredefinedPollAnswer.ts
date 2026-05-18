export type PredefinedPollAnswer = {
    id: string,
    text: string,
    answers: string[],
}

export const YES_NO = {
        id: 'yesNo',
        text: "Yes/No",
        answers: ['Yes', 'No']
    },
    AGREE_DISAGREE =
        {
            id: 'agreeDisagree',
            text: 'Agree -> Disagree',
            answers: ['Agree', 'Neutral', 'Disagree']
        },
    USEFUL =
        {
            id: 'useful',
            text: 'Very Useful -> Not useful',
            answers: ['Very useful', 'Somewhat useful', 'Not at all useful']
        },
    MON_FRI =
        {
            id: 'monFri',
            text: "Monday -> Friday",
            answers: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
        },
    STRONGLY_AGREE_DISAGREE =
        {
            id: 'stronglyAgreeDisagree',
            text: 'Strongly Agree -> Disagree',
            answers: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree']
        },
    IMPORTANT_NOT_IMPORTANT =
        {
            id: 'important',
            text: 'Very Important -> Unimportant',
            answers: ['Very important', 'Somewhat important', 'Neutral', 'Unimportant', 'Very unimportant']
        },
    ONE_TO_FIVE =
        {
            id: '1to5',
            text: '1-to-5',
            answers: ['1', '2', '3', '4', '5']
        },
    ONE_TO_TEN =
        {
            id: '1to10',
            text: '1-to-10',
            answers: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
        },
    CUSTOM =
        {
            id: 'custom',
            text: 'Custom',
            answers: [],
        }

export const PREDEFINED_ANSWERS: PredefinedPollAnswer[] = [
    YES_NO,
    AGREE_DISAGREE,
    USEFUL,
    MON_FRI,
    STRONGLY_AGREE_DISAGREE,
    IMPORTANT_NOT_IMPORTANT,
    ONE_TO_FIVE,
    ONE_TO_TEN
]

export const PREDEFINED_ANSWERS_MODAL: PredefinedPollAnswer[] = [
    CUSTOM,
    YES_NO,
    AGREE_DISAGREE,
    MON_FRI,
    ONE_TO_FIVE,
]