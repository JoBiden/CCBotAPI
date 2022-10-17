using CCBotAPI.Models;
using CCBotAPI.Services;
using Microsoft.AspNetCore.Mvc;

namespace CCBotAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CommandController : ControllerBase
    {
        private readonly CommandService _commandService;

        public CommandController(CommandService commandService) =>
            _commandService = commandService;

        [HttpGet]
        public async Task<List<Command>> Get() =>
            await _commandService.GetAsync();

        [HttpGet("{id:length(24)}")]
        public async Task<ActionResult<Command>> Get(string id)
        {
            var command = await _commandService.GetAsync(id);

            if (command is null)
            {
                return NotFound();
            }

            return command;
        }

        [HttpPost]
        public async Task<IActionResult> Post(Command newCommand)
        {
            await _commandService.CreateAsync(newCommand);

            return CreatedAtAction(nameof(Get), new { id = newCommand.Id }, newCommand);
        }

        [HttpPut("{id:length(24)}")]
        public async Task<IActionResult> Update(string id, Command updatedCommand)
        {
            var command = await _commandService.GetAsync(id);

            if (command is null)
            {
                return NotFound();
            }

            updatedCommand.Id = command.Id;

            await _commandService.UpdateAsync(id, updatedCommand);

            return NoContent();
        }

        [HttpDelete("{id:length(24)}")]
        public async Task<IActionResult> Delete(string id)
        {
            var command = await _commandService.GetAsync(id);

            if (command is null)
            {
                return NotFound();
            }

            await _commandService.RemoveAsync(id);

            return NoContent();
        }
    }
}
