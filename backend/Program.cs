using Chemistry_Cafe_API.Services;
using MySqlConnector;

var builder = WebApplication.CreateBuilder(args);

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
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

//Adds SQL data source from appsettings.json file

builder.Services.AddMySqlDataSource(builder.Configuration.GetConnectionString("DefaultConnection")!);



var app = builder.Build();

// Configure CORS
app.UseCors(options =>
{
    options.WithOrigins("http://localhost:5173")
           .AllowAnyMethod()
           .AllowAnyHeader();
});

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
