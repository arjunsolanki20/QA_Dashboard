using Serilog;
using PuffinRecon.API.Infrastructure;
using PuffinRecon.API.Middleware;
using PuffinRecon.API.Services;

// ── Bootstrap Serilog ──────────────────────────────────────────────────────
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .WriteTo.File("logs/puffin-recon-.log", rollingInterval: RollingInterval.Day)
    .CreateLogger();

try
{
    Log.Information("Starting Puffin Reconciliation API");

    var builder = WebApplication.CreateBuilder(args);

    // ── Serilog ──
    builder.Host.UseSerilog();

    // ── Services ──
    builder.Services.AddControllers()
        .AddJsonOptions(o =>
        {
            o.JsonSerializerOptions.PropertyNamingPolicy =
                System.Text.Json.JsonNamingPolicy.CamelCase;
        });

    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen(c =>
    {
        c.SwaggerDoc("v1", new() { Title = "Puffin Reconciliation API", Version = "v1" });
    });

    // ── Dependency Injection ──
    builder.Services.AddSingleton<IDbConnectionFactory, SqlConnectionFactory>();

    builder.Services.AddScoped<IReconciliationService, ReconciliationService>();

    // ✅ NEW SERVICE REGISTRATION (Insert Records Feature)
    builder.Services.AddScoped<IInsertRecordsService, InsertRecordsService>();

    // ── CORS ──
    var allowedOrigins = builder.Configuration
        .GetSection("Cors:AllowedOrigins")
        .Get<string[]>() ?? new[] { "http://localhost:5173", "http://localhost:3000" };

    builder.Services.AddCors(options =>
    {
        options.AddPolicy("PuffinCors", policy =>
            policy.WithOrigins(allowedOrigins)
                  .AllowAnyHeader()
                  .AllowAnyMethod());
    });

    // ── Build ──
    var app = builder.Build();

    // ── Middleware ──
    app.UseMiddleware<GlobalExceptionMiddleware>();

    // ── Swagger (Enabled in all environments) ──
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Puffin Reconciliation API v1");
        c.RoutePrefix = "swagger";
    });

    app.UseCors("PuffinCors");
    app.UseSerilogRequestLogging();

    app.UseAuthorization();

    app.MapControllers();

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application startup failed");
}
finally
{
    Log.CloseAndFlush();
}