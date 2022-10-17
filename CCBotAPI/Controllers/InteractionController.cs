using CCBotAPI.Models;
using CCBotAPI.Services;
using Microsoft.AspNetCore.Mvc;

namespace CCBotAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InteractionController : ControllerBase
    {
        private readonly InteractionService _interactionService;

        public InteractionController(InteractionService interactionService) =>
            _interactionService = interactionService;

        [HttpGet]
        public async Task<List<Interaction>> Get() =>
            await _interactionService.GetAsync();

        [HttpGet("{id:length(24)}")]
        public async Task<ActionResult<Interaction>> Get(string id)
        {
            var interaction = await _interactionService.GetAsync(id);

            if (interaction is null)
            {
                return NotFound();
            }

            return interaction;
        }

        [HttpPost]
        public async Task<IActionResult> Post(Interaction newInteraction)
        {
            await _interactionService.CreateAsync(newInteraction);

            return CreatedAtAction(nameof(Get), new { id = newInteraction.Id }, newInteraction);
        }

        [HttpPut("{id:length(24)}")]
        public async Task<IActionResult> Update(string id, Interaction updatedInteraction)
        {
            var interaction = await _interactionService.GetAsync(id);

            if (interaction is null)
            {
                return NotFound();
            }

            updatedInteraction.Id = interaction.Id;

            await _interactionService.UpdateAsync(id, updatedInteraction);

            return NoContent();
        }

        [HttpDelete("{id:length(24)}")]
        public async Task<IActionResult> Delete(string id)
        {
            var interaction = await _interactionService.GetAsync(id);

            if (interaction is null)
            {
                return NotFound();
            }

            await _interactionService.RemoveAsync(id);

            return NoContent();
        }
    }
}
