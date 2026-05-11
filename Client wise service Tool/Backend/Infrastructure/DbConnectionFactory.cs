using Microsoft.Data.SqlClient;
using System.Data;

namespace PuffinRecon.API.Infrastructure;

public interface IDbConnectionFactory
{
    IDbConnection CreateConnection();
}

public class SqlConnectionFactory : IDbConnectionFactory
{
    private readonly string _connectionString;

    public SqlConnectionFactory(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("PuffinDB")
            ?? throw new InvalidOperationException("Connection string 'PuffinDB' not configured.");
    }

    public IDbConnection CreateConnection()
    {
        var conn = new SqlConnection(_connectionString);
        conn.Open();
        return conn;
    }
}
