using CCBotAPI.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace CCBotAPI.Services
{
    public class PendingCommandService
    {
        private readonly IMongoCollection<PendingCommand> _pendingCommandCollection;

        public PendingCommandService(
            IOptions<ChateauDbDatabaseSettings> ChateauDbDatabaseSettings)
        {
            var mongoClient = new MongoClient(
                ChateauDbDatabaseSettings.Value.ConnectionString);

            var mongoDatabase = mongoClient.GetDatabase(
                ChateauDbDatabaseSettings.Value.DatabaseName);

            _pendingCommandCollection = mongoDatabase.GetCollection<PendingCommand>(
                ChateauDbDatabaseSettings.Value.PendingCommandCollectionName);
        }

        public async Task<List<PendingCommand>> GetAsync() =>
            await _pendingCommandCollection.Find(_ => true).ToListAsync();

        public async Task<PendingCommand?> GetAsync(string id) =>
            await _pendingCommandCollection.Find(x => x.Id == id).FirstOrDefaultAsync();

        public async Task CreateAsync(PendingCommand newPendingCommand) =>
            await _pendingCommandCollection.InsertOneAsync(newPendingCommand);

        public async Task UpdateAsync(string id, PendingCommand updatedPendingCommand) =>
            await _pendingCommandCollection.ReplaceOneAsync(x => x.Id == id, updatedPendingCommand);
        public async Task RemoveAsync(string id) =>
            await _pendingCommandCollection.DeleteOneAsync(x => x.Id == id);



    }
}
