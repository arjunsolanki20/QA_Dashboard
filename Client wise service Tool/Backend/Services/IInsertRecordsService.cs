using PuffinRecon.API.Models;

namespace PuffinRecon.API.Services
{
    public interface IInsertRecordsService
    {
        Task<InsertRecordsResult> InsertRecordsAsync(InsertRecordsRequest request);
    }
}