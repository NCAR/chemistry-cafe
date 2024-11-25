// MySqlDataSourceWrapper.cs
using MySqlConnector;
using System.Threading;
using System.Threading.Tasks;

public class MySqlDataSourceWrapper : IMySqlDataSource
{
    private readonly MySqlDataSource _dataSource;

    public MySqlDataSourceWrapper(MySqlDataSource dataSource)
    {
        _dataSource = dataSource;
    }

    public Task<MySqlConnection> OpenConnectionAsync(CancellationToken cancellationToken)
    {
        return _dataSource.OpenConnectionAsync(cancellationToken).AsTask();
    }
}
