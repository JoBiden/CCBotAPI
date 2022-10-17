using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Text.Json.Serialization;

namespace CCBotAPI.Models;

public class Interaction
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    public string initiator { get; set; } = null!;

    public string recipient { get; set; } = null!;

    public string type { get; set; } = null!;

    public Identifier identifier { get; set; } = null!;
    public string investmentLevel { get; set; } = null!;

    public BsonArray extraParameters { get; set; } = null!;

    public DateTime interactionTime { get; set; }
}
