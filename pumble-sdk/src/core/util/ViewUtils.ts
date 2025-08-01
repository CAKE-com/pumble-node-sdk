import {V1} from "../../api";
import ViewType = V1.ViewType;
import View = V1.View;
import MainBlock = V1.MainBlock;
import BlockTextElement = V1.BlockTextElement;
import State = V1.State;

export class ViewBuilder<T extends ViewType> {
    private view: View<T>;
    constructor(view: View<T>) {
        this.view = structuredClone(view);
    }

    public updateBlocks(blocks: MainBlock[]): ViewBuilder<T> {
        this.view.blocks = blocks;
        return this;
    }

    public appendBlocks(blocks: MainBlock[]): ViewBuilder<T>  {
        this.view.blocks.push(...blocks);
        return this;
    }

    public prependBlocks(blocks: MainBlock[]): ViewBuilder<T> {
        this.view.blocks = [...blocks, ...this.view.blocks];
        return this;
    }

    public insertBlocks(index: number, blocks: MainBlock[]): ViewBuilder<T> {
        this.view.blocks.splice(index, 0, ...blocks);
        return this;
    }

    public removeBlock(index: number): ViewBuilder<T> {
        this.view.blocks.splice(index, 1);
        return this;
    }

    public removeBlocks(index: number, deleteCount: number): ViewBuilder<T> {
        this.view.blocks.splice(index, deleteCount);
        return this;
    }

    public updateState(state: State): ViewBuilder<T> {
        this.view.state = state;
        return this;
    }

    public updateTitle(title: BlockTextElement): ViewBuilder<T> {
        this.view.title = title;
        return this;
    }

    public updateCallbackId(callbackId: string): ViewBuilder<T> {
        if (this.view.type === 'HOME') {
            return this;
        }
        this.view = { ...this.view, callbackId };
        return this;
    }

    public updateNotifyOnClose(notifyOnClose: boolean): ViewBuilder<T> {
        if (this.view.type === 'HOME') {
            return this;
        }
        this.view = { ...this.view, notifyOnClose };
        return this;
    }

    public updateSubmit(submit: BlockTextElement): ViewBuilder<T> {
        if (this.view.type === 'HOME') {
            return this;
        }
        this.view = { ...this.view, submit };
        return this;
    }

    public removeSubmit(): ViewBuilder<T> {
        if (this.view.type === 'HOME') {
            return this;
        }
        this.view = { ...this.view, submit: undefined };
        return this;
    }

    public updateClose(close: BlockTextElement): ViewBuilder<T> {
        if (this.view.type === 'HOME') {
            return this;
        }
        this.view = { ...this.view, close};
        return this;
    }

    public removeClose(): ViewBuilder<T> {
        if (this.view.type === 'HOME') {
            return this;
        }
        this.view = { ...this.view, close: undefined };
        return this;
    }

    public build() : View<T> {
        return this.view;
    }
}