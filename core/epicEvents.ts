import events from "events";

export class EpicEvents {
    //Defaults
    public events = new events.EventEmitter;
    //Methods
    public emit = (event: string | symbol, ...args: any[]): EpicEvents => {
        if (typeof event == "string") event = "Epic." + event;
        this.events.emit(event, args);
        return this;
    };

    public on = (event: string | symbol, listener: (...args: any[]) => void): EpicEvents => {
        if (typeof event == "string") event = "Epic." + event;
        this.events.on(event, listener);
        return this;
    }
}