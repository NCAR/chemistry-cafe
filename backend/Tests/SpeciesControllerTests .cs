using Chemistry_Cafe_API.Controllers;
using Chemistry_Cafe_API.Models;
using Chemistry_Cafe_API.Services;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using MySqlConnector;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace Chemistry_Cafe_API.Tests
{
    [TestClass]
    public class SpeciesControllerTests
    {
        
        readonly MySqlDataSource db = DBConnection.DataSource;
        static Guid _Id = new Guid("ffffffff-ffff-ffff-ffff-ffffffffffff");
        static String _Name = "Test";
        static String _Description = "A test species created by SpeciesControllerTests.cs.";
        static String _CreatedBy = "SpeciesControllerTests.cs";
        static DateTime _CreatedDate;
        static bool found = false;

        

        [TestMethod]
        public async Task Get_All_Species()
        {
            var speciesService = new SpeciesService(db);
            var controller = new SpeciesController(speciesService);

            var actionResult = await controller.GetSpecies();

            Assert.IsNotNull(actionResult);
            var okResult = actionResult.Result as OkObjectResult;
            Assert.IsNotNull(okResult);
            Console.WriteLine("SpeciesList:");
            
            var speciesList = okResult.Value as IEnumerable<Species>;
            
            Assert.IsNotNull(speciesList);
            foreach (var species in speciesList)
            {
                if(species.Name == _Name){
                    Console.WriteLine($"Test already found in DB: ID: {species.Id}, Name: {species.Name}, Description: {species.Description}");
                    _Id = species.Id;
                    found = true;
                    break;
                }
            }
            
        }

        [TestMethod]
        public async Task Creates_species()
        {
            Console.WriteLine($"CREATE SPECIES:{found}");
            if(found){
                Console.WriteLine("Duplicate Test. Skipping...");
                Assert.IsNotNull(null);
            }
            //Arrange
            var speciesService = new SpeciesService(db);
            var controller = new SpeciesController(speciesService);

            var testSpecies = new Species
            {
                Name = _Name,
                Description = _Description,
                CreatedBy = _CreatedBy,
                CreatedDate = _CreatedDate
            };

            //Act
            var actionResult = await controller.CreateSpecies(testSpecies) ;

            //Assert
            Assert.IsNotNull(actionResult);
            Assert.IsInstanceOfType(actionResult.Result, typeof(CreatedAtActionResult));

            var createdAtActionResult = actionResult.Result as CreatedAtActionResult;
            Assert.IsNotNull(createdAtActionResult);

            var returnedSpecies = createdAtActionResult.Value as Species;
            Assert.IsNotNull(returnedSpecies);

            Assert.IsNotNull(returnedSpecies);

            _Id = returnedSpecies.Id;
            Console.WriteLine($"ID: {testSpecies.Id}, Name: {testSpecies.Name}");
            Assert.AreEqual(_Id, returnedSpecies.Id);
            Assert.AreEqual(_Name, returnedSpecies.Name);
            Assert.AreEqual(_Description, returnedSpecies.Description);
            Assert.AreEqual(_CreatedBy, returnedSpecies.CreatedBy);            
        }

        [TestMethod]
        public async Task Get_Species_Given_ID()
        {
            var speciesService = new SpeciesService(db);
            var controller = new SpeciesController(speciesService);

            var actionResult = await controller.GetSpecies(_Id);

            Console.WriteLine(actionResult.Result);

            Assert.IsNotNull(actionResult);
            var okResult = actionResult.Result as OkObjectResult;
            Assert.IsNotNull(okResult);

            var returnedSpecies = okResult.Value as Species;
            Assert.IsNotNull(returnedSpecies);
            Assert.AreEqual(_Id, returnedSpecies.Id);
            Assert.AreEqual(_Name, returnedSpecies.Name);
            Assert.AreEqual(_Description, returnedSpecies.Description);
            Assert.AreEqual(_CreatedBy, returnedSpecies.CreatedBy);
        }

        [TestMethod]
        public async Task Updates_species(){
            //Arrange
            var speciesService = new SpeciesService(db);
            var controller = new SpeciesController(speciesService);
            String newDescription = "UPDATED Description";
            String newName =  "UPDATEDTest";
            var updatedSpecies = new Species
            {
                Id = _Id,
                Name = newName,
                Description = newDescription,
                CreatedBy = _CreatedBy,
                CreatedDate = _CreatedDate
            };

            //Act
            var updateResult = await controller.UpdateSpecies(_Id, updatedSpecies) ;
            var actionResult = await controller.GetSpecies(_Id);

            //Assert
            Assert.IsNotNull(actionResult);
            Assert.IsInstanceOfType(actionResult.Result, typeof(OkObjectResult));

            var createdAtActionResult = actionResult.Result as OkObjectResult;
            Assert.IsNotNull(createdAtActionResult);

            var returnedSpecies = createdAtActionResult.Value as Species;
            Assert.IsNotNull(returnedSpecies);

            Assert.IsNotNull(returnedSpecies);

            _Id = returnedSpecies.Id;
            Assert.AreEqual(_Id, returnedSpecies.Id);
            Assert.AreEqual(newName, returnedSpecies.Name);
            Assert.AreEqual(updatedSpecies.Description, returnedSpecies.Description);
            Assert.AreEqual(_CreatedBy, returnedSpecies.CreatedBy); 
            Console.WriteLine($"ID: {returnedSpecies.Id}, Name: {returnedSpecies.Name}, Description: {returnedSpecies.Description}");           
        }

        [TestMethod]
        public async Task Delete_Species()
        {
            //Arrange
            var speciesService = new SpeciesService(db);
            var controller = new SpeciesController(speciesService);
            

            //Act
            var find_result = await controller.GetSpecies(_Id);
            Assert.IsNotNull(find_result);
            Assert.IsInstanceOfType(find_result.Result, typeof(OkObjectResult));
            

            var delete_result = await controller.DeleteSpecies(_Id);

            var find_deleted_result = await controller.GetSpecies(_Id);
            Assert.IsInstanceOfType(find_deleted_result.Result, typeof(NotFoundResult));
        }
    }
}
