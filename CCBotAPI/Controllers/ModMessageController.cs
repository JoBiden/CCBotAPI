using CCBotAPI.Models;
using CCBotAPI.Services;
using Microsoft.AspNetCore.Mvc;

namespace CCBotAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ModMessageController : ControllerBase
    {
        private readonly ModMessageService _modMessageService;

        public ModMessageController(ModMessageService modMessageService) =>
            _modMessageService = modMessageService;

        [HttpGet]
        public async Task<List<ModMessage>> Get() =>
            await _modMessageService.GetAsync();

        [HttpGet("{id:length(24)}")]
        public async Task<ActionResult<ModMessage>> Get(string id)
        {
            var modMessage = await _modMessageService.GetAsync(id);

            if (modMessage is null)
            {
                return NotFound();
            }

            return modMessage;
        }

        [HttpPost]
        public async Task<IActionResult> Post(ModMessage newModMessage)
        {
            await _modMessageService.CreateAsync(newModMessage);

            return CreatedAtAction(nameof(Get), new { id = newModMessage.Id }, newModMessage);
        }

        [HttpPut("{id:length(24)}")]
        public async Task<IActionResult> Update(string id, ModMessage updatedModMessage)
        {
            var modMessage = await _modMessageService.GetAsync(id);

            if (modMessage is null)
            {
                return NotFound();
            }

            updatedModMessage.Id = modMessage.Id;

            await _modMessageService.UpdateAsync(id, updatedModMessage);

            return NoContent();
        }

        [HttpDelete("{id:length(24)}")]
        public async Task<IActionResult> Delete(string id)
        {
            var modMessage = await _modMessageService.GetAsync(id);

            if (modMessage is null)
            {
                return NotFound();
            }

            await _modMessageService.RemoveAsync(id);

            return NoContent();
        }
    }
}
