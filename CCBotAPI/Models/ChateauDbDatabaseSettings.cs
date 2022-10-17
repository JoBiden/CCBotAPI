namespace CCBotAPI.Models
{
    public class ChateauDbDatabaseSettings
    {
        public string ConnectionString { get; set; } = null!;

        public string DatabaseName { get; set; } = null!;

        public string ProfileCollectionName { get; set; } = null!;

        public string ModMessageCollectionName { get; set; } = null!;

        public string InteractionCollectionName { get; set; } = null!;
        public string IdentifierCollectionName { get; set; } = null!;
        public string CommandCollectionName { get; set; } = null!;

        public string PendingCommandCollectionName { get; set; } = null!;

    }
}
