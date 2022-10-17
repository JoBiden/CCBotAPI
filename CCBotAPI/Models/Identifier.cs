using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Text.Json.Serialization;

namespace CCBotAPI.Models;

public class Identifier
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    public string type { get; set; } = null!;

    public string description { get; set; } = null!;

    public string[] categories { get; set; } = null!;

}
