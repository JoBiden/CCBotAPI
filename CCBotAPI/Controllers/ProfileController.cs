using CCBotAPI.Models;
using CCBotAPI.Services;
using Microsoft.AspNetCore.Mvc;

namespace CCBotAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProfileController : ControllerBase
    {
        private readonly ProfileService _profileService;

        public ProfileController(ProfileService profileService) =>
            _profileService = profileService;

        [HttpGet]
        public async Task<List<Profile>> Get() =>
            await _profileService.GetAsync();

        [HttpGet("{id:length(24)}")]
        public async Task<ActionResult<Profile>> Get(string id)
        {
            var profile = await _profileService.GetAsync(id);

            if (profile is null)
            {
                return NotFound();
            }

            return profile;
        }

        [HttpPost]
        public async Task<IActionResult> Post(Profile newProfile)
        {
            await _profileService.CreateAsync(newProfile);

            return CreatedAtAction(nameof(Get), new { id = newProfile.Id }, newProfile);
        }

        [HttpPut("{id:length(24)}")]
        public async Task<IActionResult> Update(string id, Profile updatedProfile)
        {
            var profile = await _profileService.GetAsync(id);

            if (profile is null)
            {
                return NotFound();
            }

            updatedProfile.Id = profile.Id;

            await _profileService.UpdateAsync(id, updatedProfile);

            return NoContent();
        }

        [HttpDelete("{id:length(24)}")]
        public async Task<IActionResult> Delete(string id)
        {
            var profile = await _profileService.GetAsync(id);

            if (profile is null)
            {
                return NotFound();
            }

            await _profileService.RemoveAsync(id);

            return NoContent();
        }
    }
}
