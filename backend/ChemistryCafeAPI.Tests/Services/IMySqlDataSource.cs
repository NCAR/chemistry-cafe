// IMySqlDataSource.cs
using MySqlConnector;
using System.Threading;
using System.Threading.Tasks;

public interface IMySqlDataSource
{
    Task<MySqlConnection> OpenConnectionAsync(CancellationToken cancellationToken);
}
