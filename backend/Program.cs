using MySqlConnector;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using Chemistry_Cafe_API.Services;
using dotenv.net;


var builder = WebApplication.CreateBuilder(args);

if (!builder.Environment.IsDevelopment())
{
    builder.WebHost.UseUrls("http://0.0.0.0:5000");
}

// Configure Environment
DotEnv.Load();

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddScoped<FamilyService>();
builder.Services.AddScoped<MechanismService>();
builder.Services.AddScoped<SpeciesService>();
builder.Services.AddScoped<ReactionService>();
builder.Services.AddScoped<ReactionSpeciesService>();
builder.Services.AddScoped<MechanismSpeciesService>();
builder.Services.AddScoped<MechanismReactionService>();
builder.Services.AddScoped<InitialConditionSpeciesService>();
builder.Services.AddScoped<OpenAtmosService>();
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<PropertyService>();
builder.Services.AddScoped<GoogleOAuthService>();

string googleClientId = Environment.GetEnvironmentVariable("GOOGLE_CLIENT_ID") ?? throw new InvalidOperationException("GOOGLE_CLIENT_ID environment variable is missing.");
string googleClientSecret = Environment.GetEnvironmentVariable("GOOGLE_CLIENT_SECRET") ?? throw new InvalidOperationException("GOOGLE_CLIENT_SECRET environment variable is missing.");

builder.Services.AddAuthentication((options) =>
    {
        options.DefaultScheme = "Application";
        options.DefaultSignInScheme = "External";
    })
    .AddCookie("Application")
    .AddCookie("External")
    .AddGoogle((options) =>
    {
        options.ClientId = googleClientId;
        options.ClientSecret = googleClientSecret;
    });

//builder.Services.AddScoped<TimeService>();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

//Adds SQL data source from appsettings.json file
var server = Environment.GetEnvironmentVariable("MYSQL_SERVER") ?? "localhost";
var user = Environment.GetEnvironmentVariable("MYSQL_USER") ?? throw new InvalidOperationException("MYSQL_USER environment variable is missing.");
var password = Environment.GetEnvironmentVariable("MYSQL_PASSWORD") ?? throw new InvalidOperationException("MYSQL_PASSWORD environment variable is missing.");
var database = Environment.GetEnvironmentVariable("MYSQL_DATABASE") ?? throw new InvalidOperationException("MYSQL_DATABASE environment variable is missing.");
var port = Environment.GetEnvironmentVariable("MYSQL_PORT") ?? "3306";

var connectionString = $"Server={server};Port={port};Database={database};User={user};Password={password}";
// builder.Services.AddMySqlDataSource(connectionString);

builder.Services.AddDbContext<Chemistry_Cafe_API.Models.ChemistryDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

builder.Services.AddCors(options =>
{
    options.AddPolicy("DevelopmentCorsPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
               .AllowAnyMethod()
               .AllowAnyHeader()
               .AllowCredentials();
    });

    options.AddPolicy("ProductionCorsPolicy", policy =>
    {
        policy.WithOrigins("https://cafe-deux-devel.acom.ucar.edu")
               .AllowAnyMethod()
               .AllowAnyHeader()
               .AllowCredentials();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseCors("DevelopmentCorsPolicy");
}
else
{
    app.UseCors("ProductionCorsPolicy");
    app.UseForwardedHeaders(new ForwardedHeadersOptions
    {
        ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
    });
}

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();