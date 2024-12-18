using Chemistry_Cafe_API.Services;
using MySqlConnector;
using Microsoft.AspNetCore.HttpOverrides;

var builder = WebApplication.CreateBuilder(args);

if (!builder.Environment.IsDevelopment())
{
    builder.WebHost.UseUrls("http://0.0.0.0:5000");
}

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
//builder.Services.AddScoped<TimeService>();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

//Adds SQL data source from appsettings.json file

string connectionString;
if (builder.Environment.IsDevelopment())
{
    connectionString = builder.Configuration.GetConnectionString("HostConnection") ?? throw new InvalidOperationException("HostConnection string is missing.");
}
else
{
    connectionString = builder.Configuration.GetConnectionString("ProductionConnection") ?? throw new InvalidOperationException("ProductionConnection string is missing.");
}

builder.Services.AddMySqlDataSource(connectionString);

builder.Services.AddCors(options =>
{
    options.AddPolicy("DevelopmentCorsPolicy", builder =>
    {
        builder.WithOrigins("http://localhost:5173")
               .AllowAnyMethod()
               .AllowAnyHeader();
    });

    options.AddPolicy("ProductionCorsPolicy", builder =>
    {
        builder.WithOrigins("https://cafe-deux-devel.acom.ucar.edu")
               .AllowAnyMethod()
               .AllowAnyHeader();
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

app.UseAuthorization();
app.MapControllers();
app.Run();