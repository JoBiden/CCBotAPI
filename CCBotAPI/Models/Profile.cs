using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Text.Json.Serialization;

namespace CCBotAPI.Models;

public class Profile
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    public string userName { get; set; } = null!;

    public string displayName { get; set; } = null!;

    public BsonArray counts { get; set; } = null!;

    public BsonArray lists { get; set; } = null!;
    public BsonArray timers { get; set; } = null!;
}
