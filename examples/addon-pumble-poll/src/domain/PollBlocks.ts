import {V1} from "pumble-sdk";
import BlockInput = V1.BlockInput;
import BlockButton = V1.BlockButton;

export const DEFAULT_BLOCK_ANSWERS = [{
    type: "input",
    blockId: `input_answer_0`,
    label: {type: "plain_text", text: `Option 1`},
    element: {
        type: "plain_text_input",
        onAction: `input_answer_0`,
        placeholder: {text: "Option 1", type: "plain_text"},
        max_length: 75,
        min_length: 1
    },
    optional: false
} as BlockInput, {
    type: "input",
    blockId: `input_answer_1`,
    label: {type: "plain_text", text: `Option 2`},
    element: {
        type: "plain_text_input",
        onAction: `input_answer_1`,
        placeholder: {text: "Option 2", type: "plain_text"},
        max_length: 75,
        min_length: 1
    },
    optional: false
} as BlockInput];

export const ADD_OPTION_BUTTON = {
    type: "button",
    onAction: "addOption",
    style: "secondary",
    text: {type: "plain_text", text: "Add option"}
} as BlockButton;

export const REMOVE_OPTION_BUTTON = {
    type: "button",
    onAction: "removeOption",
    style: "secondary",
    text: {type: "plain_text", text: "Remove option"}
} as BlockButton;