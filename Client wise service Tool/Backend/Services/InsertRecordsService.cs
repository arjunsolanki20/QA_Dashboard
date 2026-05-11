using System.Data;
using Dapper;
using PuffinRecon.API.Infrastructure;
using PuffinRecon.API.Models;

namespace PuffinRecon.API.Services
{
    public class InsertRecordsService : IInsertRecordsService
    {
        private readonly IDbConnectionFactory _db;

        public InsertRecordsService(IDbConnectionFactory db)
        {
            _db = db;
        }

        public async Task<InsertRecordsResult> InsertRecordsAsync(InsertRecordsRequest request)
        {
            using var conn = _db.CreateConnection();

            var parameters = new DynamicParameters();
            parameters.Add("@MobileNumber", request.MobileNumber);
            parameters.Add("@PreferredLanguage", request.PreferredLanguage);

            // Convert journey list to comma-separated string
            parameters.Add("@JourneyList", 
                request.Journeys != null && request.Journeys.Any() 
                    ? string.Join(",", request.Journeys) 
                    : null);

            var rowsInserted = await conn.ExecuteScalarAsync<int>(
                "sp_InsertSourceRecords",
                parameters,
                commandType: CommandType.StoredProcedure
            );

            return new InsertRecordsResult
            {
                RowsInserted = rowsInserted,
                InsertedAt = DateTime.UtcNow,
                Journeys = request.Journeys
            };
        }
    }
}