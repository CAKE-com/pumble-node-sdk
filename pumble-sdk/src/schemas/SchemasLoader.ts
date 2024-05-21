import Ajv from 'ajv';
import { mainBlocks } from './mainBlocks';
import {attachmentActionsBlock} from "./attachmentActionsBlock";

class SchemasLoader {
    private ajv = new Ajv({
        schemas: [mainBlocks],
        strict: false,
    });

    public async blocksValid(data: any[]): Promise<boolean> {
        const validate = this.ajv.compile(mainBlocks);
        if (validate) {
            if (!validate(data)) {
                console.error(validate.errors);
                return false;
            }
        }
        return true;
    }

    public async attachmentBlocksValid(data: any[]): Promise<boolean> {
        const validate = this.ajv.compile(attachmentActionsBlock);
        if (validate) {
            for (let i = 0; i < data.length; ++i) {
                if (data[i].actions && !validate(data[i].actions)) {
                    console.error(validate.errors);
                    return false;
                }
            }
        }
        return true;
    }
}

export const schemasLoader = new SchemasLoader();
