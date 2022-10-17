using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Text.Json.Serialization;

namespace CCBotAPI.Models;

public class PendingCommand
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    public Interaction pending { get; set; } = null!;

    public string awaiting { get; set; } = null!;

}
