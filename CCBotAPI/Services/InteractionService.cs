using CCBotAPI.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace CCBotAPI.Services
{
    public class InteractionService
    {
        private readonly IMongoCollection<Interaction> _interactionCollection;

        public InteractionService(
            IOptions<ChateauDbDatabaseSettings> ChateauDbDatabaseSettings)
        {
            var mongoClient = new MongoClient(
                ChateauDbDatabaseSettings.Value.ConnectionString);

            var mongoDatabase = mongoClient.GetDatabase(
                ChateauDbDatabaseSettings.Value.DatabaseName);

            _interactionCollection = mongoDatabase.GetCollection<Interaction>(
                ChateauDbDatabaseSettings.Value.InteractionCollectionName);
        }

        public async Task<List<Interaction>> GetAsync() =>
            await _interactionCollection.Find(_ => true).ToListAsync();

        public async Task<Interaction?> GetAsync(string id) =>
            await _interactionCollection.Find(x => x.Id == id).FirstOrDefaultAsync();

        public async Task CreateAsync(Interaction newInteraction) =>
            await _interactionCollection.InsertOneAsync(newInteraction);

        public async Task UpdateAsync(string id, Interaction updatedInteraction) =>
            await _interactionCollection.ReplaceOneAsync(x => x.Id == id, updatedInteraction);
        public async Task RemoveAsync(string id) =>
            await _interactionCollection.DeleteOneAsync(x => x.Id == id);



    }
}
