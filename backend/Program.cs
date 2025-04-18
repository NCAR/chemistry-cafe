using ChemistryCafeAPI.Services;
using MySqlConnector;
using Microsoft.AspNetCore.HttpOverrides;
using ChemistryCafeAPI.Controllers;
using ChemistryCafeAPI.Models;
using dotenv.net;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Http;

var builder = WebApplication.CreateBuilder(args);

if (!builder.Environment.IsDevelopment())
{
    builder.WebHost.UseUrls("http://0.0.0.0:5000");
}

// Configure Environment
DotEnv.Load();

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<GoogleOAuthService>();
builder.Services.AddScoped<FamilyService>();

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
        options.AccessDeniedPath = "/auth/google/login";
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

var connectionString = $"Server={server};Port={port};Database={database};User={user};Password={password};AllowUserVariables=True;UseAffectedRows=False;";
builder.Services.AddDbContext<ChemistryDbContext>(options =>
{
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString));
});

string frontendHost = Environment.GetEnvironmentVariable("FRONTEND_HOST") ?? "http://localhost:5173";
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
        policy.WithOrigins(frontendHost)
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
