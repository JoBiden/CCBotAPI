using CCBotAPI.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace CCBotAPI.Services
{
    public class IdentifierService
    {
        private readonly IMongoCollection<Identifier> _identifierCollection;

        public IdentifierService(
            IOptions<ChateauDbDatabaseSettings> ChateauDbDatabaseSettings)
        {
            var mongoClient = new MongoClient(
                ChateauDbDatabaseSettings.Value.ConnectionString);

            var mongoDatabase = mongoClient.GetDatabase(
                ChateauDbDatabaseSettings.Value.DatabaseName);

            _identifierCollection = mongoDatabase.GetCollection<Identifier>(
                ChateauDbDatabaseSettings.Value.IdentifierCollectionName);
        }

        public async Task<List<Identifier>> GetAsync() =>
            await _identifierCollection.Find(_ => true).ToListAsync();

        public async Task<Identifier?> GetAsync(string id) =>
            await _identifierCollection.Find(x => x.Id == id).FirstOrDefaultAsync();

        public async Task CreateAsync(Identifier newIdentifier) =>
            await _identifierCollection.InsertOneAsync(newIdentifier);

        public async Task UpdateAsync(string id, Identifier updatedIdentifier) =>
            await _identifierCollection.ReplaceOneAsync(x => x.Id == id, updatedIdentifier);
        public async Task RemoveAsync(string id) =>
            await _identifierCollection.DeleteOneAsync(x => x.Id == id);



    }
}
