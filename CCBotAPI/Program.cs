using CCBotAPI.Models;
using CCBotAPI.Services;
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.Configure<ChateauDbDatabaseSettings>(
    builder.Configuration.GetSection("ChateauDbDatabase"));
builder.Services.AddSingleton<ProfileService>();
builder.Services.AddSingleton<PendingCommandService>();
builder.Services.AddSingleton<ModMessageService>();
builder.Services.AddSingleton<InteractionService>();
builder.Services.AddSingleton<IdentifierService>();
builder.Services.AddSingleton<CommandService>();


builder.Services.AddControllers()
    .AddJsonOptions(
        options => options.JsonSerializerOptions.PropertyNamingPolicy = null);


// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseDefaultFiles();

app.UseStaticFiles();

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
