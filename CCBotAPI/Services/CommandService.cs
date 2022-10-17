using CCBotAPI.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace CCBotAPI.Services
{
    public class CommandService
    {
        private readonly IMongoCollection<Command> _commandCollection;

        public CommandService(
            IOptions<ChateauDbDatabaseSettings> ChateauDbDatabaseSettings)
        {
            var mongoClient = new MongoClient(
                ChateauDbDatabaseSettings.Value.ConnectionString);

            var mongoDatabase = mongoClient.GetDatabase(
                ChateauDbDatabaseSettings.Value.DatabaseName);

            _commandCollection = mongoDatabase.GetCollection<Command>(
                ChateauDbDatabaseSettings.Value.CommandCollectionName);
        }

        public async Task<List<Command>> GetAsync() =>
            await _commandCollection.Find(_ => true).ToListAsync();

        public async Task<Command?> GetAsync(string id) =>
            await _commandCollection.Find(x => x.Id == id).FirstOrDefaultAsync();

        public async Task CreateAsync(Command newCommand) =>
            await _commandCollection.InsertOneAsync(newCommand);

        public async Task UpdateAsync(string id, Command updatedCommand) =>
            await _commandCollection.ReplaceOneAsync(x => x.Id == id, updatedCommand);
        public async Task RemoveAsync(string id) =>
            await _commandCollection.DeleteOneAsync(x => x.Id == id);



    }
}
