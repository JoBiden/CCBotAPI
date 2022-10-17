using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Text.Json.Serialization;

namespace CCBotAPI.Models;

public class Command
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    public string commandName { get; set; } = null!;

    public string[] aliases { get; set; } = null!;

    public string[] neededParams { get; set; } = null!;

    public string[] extraParams { get; set; } = null!;

    public string description { get; set; } = null!;

}
