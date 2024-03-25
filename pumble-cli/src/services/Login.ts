import prompts from 'prompts';
import { cliPumbleApiClient } from './PumbleApiClient';
import { cliEnvironment } from './Environment';
import {
    PUMBLE_ACCESS_TOKEN_KEY,
    PUMBLE_REFRESH_TOKEN_KEY,
    PUMBLE_WORKSPACE_ID_KEY,
    PUMBLE_WORKSPACE_USER_ID_KEY,
} from './Environment';
import { cliGlobals } from './Globals';
import { cyan, gray, green, yellow } from 'ansis';

class Login {
    public isLoggedIn(): boolean {
        return !(
            !cliEnvironment.accessToken ||
            !cliEnvironment.refreshToken ||
            !cliEnvironment.workspaceId ||
            !cliEnvironment.workspaceUserId
        );
    }

    public async logout() {
        await cliEnvironment.deleteGlobalEnvironment(
            PUMBLE_ACCESS_TOKEN_KEY,
            PUMBLE_REFRESH_TOKEN_KEY,
            PUMBLE_WORKSPACE_USER_ID_KEY,
            PUMBLE_WORKSPACE_ID_KEY
        );
    }

    public async login(): Promise<boolean> {
        if (this.isLoggedIn()) {
            return true;
        }
        const { email } = await prompts([{ name: 'email', message: 'To login enter your Pumble email', type: 'text' }]);
        if (!email || !email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
            throw new Error('Invalid email address');
        }

        const leadId = await cliPumbleApiClient.lead(email);

        const { code } = await prompts([
            {
                name: 'code',
                message: 'Please enter the verification code sent to your email',
                type: 'text',
            },
        ]);

        await cliPumbleApiClient.activateLead(email, code);
        const loginResponse = await cliPumbleApiClient.leadLogin(leadId);

        const options = loginResponse.items.map((x) => ({ title: x.workspace.name, value: x.workspace.id }));
        const { workspace_id } = await prompts([
            {
                message: 'Select a workspace',
                type: 'select',
                name: 'workspace_id',
                choices: [...options, { value: 'NEW_WORKSPACE', title: 'Create a new workspace (recommended)' }],
            },
        ]);
        if (!workspace_id) {
            throw new Error('Cannot continue without selecting a workspace');
        }

        if (workspace_id !== 'NEW_WORKSPACE') {
            const selected = loginResponse.items.find((x) => x.workspace.id === workspace_id);
            const exchangeToken = selected!.exchangeToken;
            const tokens = await cliPumbleApiClient.exchangeToken(selected!.workspace.id, exchangeToken);
            await cliEnvironment.setGlobalEnvironment({
                [PUMBLE_ACCESS_TOKEN_KEY]: tokens.token,
                [PUMBLE_REFRESH_TOKEN_KEY]: tokens.refreshToken,
                [PUMBLE_WORKSPACE_ID_KEY]: selected!.workspace.id,
                [PUMBLE_WORKSPACE_USER_ID_KEY]: selected!.workspaceUser.id,
            });
            const workspaceName = options.find((x) => x.value === workspace_id)?.title;
            console.log(green`✅ You have successfully connected to ` + cyan`${workspaceName || ''}`);
            console.log(gray`Authorization info saved at ` + yellow`${cliGlobals.globalConfigFile}`);
        } else {
            const { name: workspaceName } = await prompts([
                {
                    name: 'name',
                    message: 'Please enter the workspace name',
                    type: 'text',
                },
            ]);
            if (!workspaceName) {
                throw new Error('Cannot continue without a workspace name');
            }
            const workspaceResponse = await cliPumbleApiClient.createWorkspace(workspaceName, leadId);
            const tokens = await cliPumbleApiClient.exchangeToken(
                workspaceResponse.workspace.id,
                workspaceResponse.exchangeToken
            );
            await cliEnvironment.setGlobalEnvironment({
                [PUMBLE_ACCESS_TOKEN_KEY]: tokens.token,
                [PUMBLE_REFRESH_TOKEN_KEY]: tokens.refreshToken,
                [PUMBLE_WORKSPACE_ID_KEY]: workspaceResponse.workspace.id,
                [PUMBLE_WORKSPACE_USER_ID_KEY]: workspaceResponse.workspaceUser.id,
            });
            console.log(green`✅ You have successfully connected to ` + cyan`${workspaceResponse.workspace.name}`);
            console.log(gray`Authorization info saved at ` + yellow`${cliGlobals.globalConfigFile}`);
        }
        return false;
    }
}
export const cliLogin = new Login();
