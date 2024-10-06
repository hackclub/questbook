abstract class Quest {
    public abstract questId: string;
    public abstract description: string;
    public abstract tier: number;

    
    public abstract register({slackId}: {
        slackId: string
    }): Promise<void>;

    /**
     * @description Peforms a routine that checks quest progression or completion
     */
    public abstract poll({slackId} : {
        slackId: string
    }): void;

    /**
     * @description Sets up event listeners for quest progression, executed once
     */
    public abstract listen(): Promise<void>;    
}

export default Quest;