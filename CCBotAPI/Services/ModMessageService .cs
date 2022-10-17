using CCBotAPI.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace CCBotAPI.Services
{
    public class ModMessageService
    {
        private readonly IMongoCollection<ModMessage> _modMessageCollection;

        public ModMessageService(
            IOptions<ChateauDbDatabaseSettings> ChateauDbDatabaseSettings)
        {
            var mongoClient = new MongoClient(
                ChateauDbDatabaseSettings.Value.ConnectionString);

            var mongoDatabase = mongoClient.GetDatabase(
                ChateauDbDatabaseSettings.Value.DatabaseName);

            _modMessageCollection = mongoDatabase.GetCollection<ModMessage>(
                ChateauDbDatabaseSettings.Value.ModMessageCollectionName);
        }

        public async Task<List<ModMessage>> GetAsync() =>
            await _modMessageCollection.Find(_ => true).ToListAsync();

        public async Task<ModMessage?> GetAsync(string id) =>
            await _modMessageCollection.Find(x => x.Id == id).FirstOrDefaultAsync();

        public async Task CreateAsync(ModMessage newModMessage) =>
            await _modMessageCollection.InsertOneAsync(newModMessage);

        public async Task UpdateAsync(string id, ModMessage updatedModMessage) =>
            await _modMessageCollection.ReplaceOneAsync(x => x.Id == id, updatedModMessage);
        public async Task RemoveAsync(string id) =>
            await _modMessageCollection.DeleteOneAsync(x => x.Id == id);



    }
}
