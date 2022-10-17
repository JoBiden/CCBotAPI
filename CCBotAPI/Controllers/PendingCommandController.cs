using CCBotAPI.Models;
using CCBotAPI.Services;
using Microsoft.AspNetCore.Mvc;

namespace CCBotAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PendingCommandController : ControllerBase
    {
        private readonly PendingCommandService _pendingCommandService;

        public PendingCommandController(PendingCommandService pendingCommandService) =>
            _pendingCommandService = pendingCommandService;

        [HttpGet]
        public async Task<List<PendingCommand>> Get() =>
            await _pendingCommandService.GetAsync();

        [HttpGet("{id:length(24)}")]
        public async Task<ActionResult<PendingCommand>> Get(string id)
        {
            var pendingCommand = await _pendingCommandService.GetAsync(id);

            if (pendingCommand is null)
            {
                return NotFound();
            }

            return pendingCommand;
        }

        [HttpPost]
        public async Task<IActionResult> Post(PendingCommand newPendingCommand)
        {
            await _pendingCommandService.CreateAsync(newPendingCommand);

            return CreatedAtAction(nameof(Get), new { id = newPendingCommand.Id }, newPendingCommand);
        }

        [HttpPut("{id:length(24)}")]
        public async Task<IActionResult> Update(string id, PendingCommand updatedPendingCommand)
        {
            var pendingCommand = await _pendingCommandService.GetAsync(id);

            if (pendingCommand is null)
            {
                return NotFound();
            }

            updatedPendingCommand.Id = pendingCommand.Id;

            await _pendingCommandService.UpdateAsync(id, updatedPendingCommand);

            return NoContent();
        }

        [HttpDelete("{id:length(24)}")]
        public async Task<IActionResult> Delete(string id)
        {
            var pendingCommand = await _pendingCommandService.GetAsync(id);

            if (pendingCommand is null)
            {
                return NotFound();
            }

            await _pendingCommandService.RemoveAsync(id);

            return NoContent();
        }
    }
}
