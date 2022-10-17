using CCBotAPI.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace CCBotAPI.Services
{
    public class ProfileService
    {
        private readonly IMongoCollection<Profile> _profileCollection;

        public ProfileService(
            IOptions<ChateauDbDatabaseSettings> ChateauDbDatabaseSettings)
        {
            var mongoClient = new MongoClient(
                ChateauDbDatabaseSettings.Value.ConnectionString);

            var mongoDatabase = mongoClient.GetDatabase(
                ChateauDbDatabaseSettings.Value.DatabaseName);

            _profileCollection = mongoDatabase.GetCollection<Profile>(
                ChateauDbDatabaseSettings.Value.ProfileCollectionName);
        }

        public async Task<List<Profile>> GetAsync() =>
            await _profileCollection.Find(_ => true).ToListAsync();

        public async Task<Profile?> GetAsync(string id) =>
            await _profileCollection.Find(x => x.Id == id).FirstOrDefaultAsync();

        public async Task CreateAsync(Profile newProfile) =>
            await _profileCollection.InsertOneAsync(newProfile);

        public async Task UpdateAsync(string id, Profile updatedProfile) =>
            await _profileCollection.ReplaceOneAsync(x => x.Id == id, updatedProfile);
        public async Task RemoveAsync(string id) =>
            await _profileCollection.DeleteOneAsync(x => x.Id == id);



    }
}
