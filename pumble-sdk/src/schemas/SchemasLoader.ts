import Ajv from 'ajv';
import { mainBlocks } from './mainBlocks';

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

}

export const schemasLoader = new SchemasLoader();
