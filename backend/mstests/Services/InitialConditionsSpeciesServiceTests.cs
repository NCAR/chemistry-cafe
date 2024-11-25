// using System;
// using System.Collections.Generic;
// using System.Data.Common;
// using System.Threading;
// using System.Threading.Tasks;
// using Chemistry_Cafe_API.Models;
// using Chemistry_Cafe_API.Services;
// using Moq;
// using MySqlConnector;
// using Xunit;
// using FluentAssertions;

// namespace Chemistry_CafeAPI.Tests.Services
// {
//     public class InitialConditionsSpeciesServiceTests
//     {
//         private readonly Mock<IMySqlDataSource> _mockDataSource;
//         private readonly InitialConditionSpeciesService _service;

//         public InitialConditionsSpeciesServiceTests()
//         {
//             _mockDataSource = new Mock<IMySqlDataSource>();
//             _service = new InitialConditionSpeciesService(_mockDataSource.Object);
//         }

//         [Fact]
//         public async Task GetInitialConditionsByMechanismIdAsync_ShouldReturnListOfInitialConditions()
//         {
//             // Arrange
//             var mechanismId = Guid.NewGuid();
//             var mockConnection = new Mock<MySqlConnection>();
//             var mockCommand = new Mock<MySqlCommand>();
//             var mockReader = new Mock<MySqlDataReader>();
//             var cancellationToken = CancellationToken.None;

//             _mockDataSource.Setup(ds => ds.OpenConnectionAsync(It.IsAny<CancellationToken>()))
//                 .ReturnsAsync(mockConnection.Object);

//             mockConnection.Setup(c => c.CreateCommand())
//                 .Returns(mockCommand.Object);

//             // Setup property
//             mockCommand.SetupProperty(cmd => cmd.CommandText, string.Empty);

//             // Setup parameters
//             mockCommand.Setup(cmd => cmd.Parameters.AddWithValue("@mechanismId", mechanismId));

//             // Setup ExecuteReaderAsync
//             mockCommand.Setup(cmd => cmd.ExecuteReaderAsync(cancellationToken))
//                 .ReturnsAsync(mockReader.Object);

//             var readSequence = new Queue<bool>(new[] { true, true, false });
//             mockReader.Setup(r => r.ReadAsync(It.IsAny<CancellationToken>()))
//                 .ReturnsAsync(() => readSequence.Dequeue());

//             // Mock data for two initial conditions
//             // First Initial Condition
//             var initialConditionSpeciesId1 = Guid.NewGuid();
//             var speciesId1 = Guid.NewGuid();

//             mockReader.Setup(r => r.GetGuid(r.GetOrdinal("InitialConditionSpeciesId")))
//                 .Returns(initialConditionSpeciesId1);
//             mockReader.Setup(r => r.GetGuid(r.GetOrdinal("MechanismId")))
//                 .Returns(mechanismId);
//             mockReader.Setup(r => r.GetGuid(r.GetOrdinal("SpeciesId")))
//                 .Returns(speciesId1);
//             mockReader.Setup(r => r.IsDBNull(r.GetOrdinal("Concentration")))
//                 .Returns(false);
//             mockReader.Setup(r => r.GetDouble(r.GetOrdinal("Concentration")))
//                 .Returns(1.0);
//             mockReader.Setup(r => r.IsDBNull(r.GetOrdinal("Temperature")))
//                 .Returns(false);
//             mockReader.Setup(r => r.GetDouble(r.GetOrdinal("Temperature")))
//                 .Returns(300.0);
//             mockReader.Setup(r => r.IsDBNull(r.GetOrdinal("Pressure")))
//                 .Returns(true);
//             mockReader.Setup(r => r.IsDBNull(r.GetOrdinal("AdditionalConditions")))
//                 .Returns(false);
//             mockReader.Setup(r => r.GetString(r.GetOrdinal("AdditionalConditions")))
//                 .Returns("No additional conditions");
//             mockReader.Setup(r => r.GetString(r.GetOrdinal("SpeciesName")))
//                 .Returns("Species A");
//             mockReader.Setup(r => r.IsDBNull(r.GetOrdinal("SpeciesDescription")))
//                 .Returns(true);

//             // Second Initial Condition
//             var initialConditionSpeciesId2 = Guid.NewGuid();
//             var speciesId2 = Guid.NewGuid();

//             mockReader.Setup(r => r.GetGuid(r.GetOrdinal("InitialConditionSpeciesId")))
//                 .Returns(initialConditionSpeciesId2);
//             mockReader.Setup(r => r.GetGuid(r.GetOrdinal("MechanismId")))
//                 .Returns(mechanismId);
//             mockReader.Setup(r => r.GetGuid(r.GetOrdinal("SpeciesId")))
//                 .Returns(speciesId2);
//             mockReader.Setup(r => r.IsDBNull(r.GetOrdinal("Concentration")))
//                 .Returns(true);
//             mockReader.Setup(r => r.IsDBNull(r.GetOrdinal("Temperature")))
//                 .Returns(false);
//             mockReader.Setup(r => r.GetDouble(r.GetOrdinal("Temperature")))
//                 .Returns(350.0);
//             mockReader.Setup(r => r.IsDBNull(r.GetOrdinal("Pressure")))
//                 .Returns(false);
//             mockReader.Setup(r => r.GetDouble(r.GetOrdinal("Pressure")))
//                 .Returns(1.0);
//             mockReader.Setup(r => r.IsDBNull(r.GetOrdinal("AdditionalConditions")))
//                 .Returns(true);
//             mockReader.Setup(r => r.GetString(r.GetOrdinal("SpeciesName")))
//                 .Returns("Species B");
//             mockReader.Setup(r => r.IsDBNull(r.GetOrdinal("SpeciesDescription")))
//                 .Returns(false);
//             mockReader.Setup(r => r.GetString(r.GetOrdinal("SpeciesDescription")))
//                 .Returns("Description B");

//             // Act
//             var initialConditions = await _service.GetInitialConditionsByMechanismIdAsync(mechanismId);

//             // Assert
//             initialConditions.Should().HaveCount(2);

//             var firstCondition = initialConditions[0];
//             firstCondition.Concentration.Should().Be(1.0);
//             firstCondition.Temperature.Should().Be(300.0);
//             firstCondition.Pressure.Should().BeNull();
//             firstCondition.AdditionalConditions.Should().Be("No additional conditions");
//             firstCondition.Species.Name.Should().Be("Species A");
//             firstCondition.Species.Description.Should().BeNull();

//             var secondCondition = initialConditions[1];
//             secondCondition.Concentration.Should().BeNull();
//             secondCondition.Temperature.Should().Be(350.0);
//             secondCondition.Pressure.Should().Be(1.0);
//             secondCondition.AdditionalConditions.Should().BeNull();
//             secondCondition.Species.Name.Should().Be("Species B");
//             secondCondition.Species.Description.Should().Be("Description B");

//             // Verify interactions
//             mockCommand.Verify(cmd => cmd.ExecuteReaderAsync(cancellationToken), Times.Once);
//             mockReader.Verify(r => r.ReadAsync(It.IsAny<CancellationToken>()), Times.Exactly(3));
//         }

//         [Fact]
//         public async Task CreateInitialConditionAsync_ShouldInsertAndReturnNewInitialCondition()
//         {
//             // Arrange
//             var initialCondition = new InitialConditionsSpecies
//             {
//                 MechanismId = Guid.NewGuid(),
//                 SpeciesId = Guid.NewGuid(),
//                 Concentration = 2.5,
//                 Temperature = 310.0,
//                 Pressure = null,
//                 AdditionalConditions = "Some conditions"
//             };

//             var mockConnection = new Mock<MySqlConnection>();
//             var mockCommand = new Mock<MySqlCommand>();
//             var cancellationToken = CancellationToken.None;

//             _mockDataSource.Setup(ds => ds.OpenConnectionAsync(It.IsAny<CancellationToken>()))
//                 .ReturnsAsync(mockConnection.Object);

//             mockConnection.Setup(c => c.CreateCommand())
//                 .Returns(mockCommand.Object);

//             // Setup property
//             mockCommand.SetupProperty(cmd => cmd.CommandText, string.Empty);

//             // Setup parameters
//             mockCommand.Setup(cmd => cmd.Parameters.AddWithValue("@id", It.IsAny<Guid>()))
//                 .Callback<string, object>((param, value) => { /* Optionally capture value */ });
//             mockCommand.Setup(cmd => cmd.Parameters.AddWithValue("@mechanism_id", initialCondition.MechanismId));
//             mockCommand.Setup(cmd => cmd.Parameters.AddWithValue("@species_id", initialCondition.SpeciesId));
//             mockCommand.Setup(cmd => cmd.Parameters.AddWithValue("@concentration", initialCondition.Concentration ?? (object)DBNull.Value));
//             mockCommand.Setup(cmd => cmd.Parameters.AddWithValue("@temperature", initialCondition.Temperature ?? (object)DBNull.Value));
//             mockCommand.Setup(cmd => cmd.Parameters.AddWithValue("@pressure", initialCondition.Pressure ?? (object)DBNull.Value));
//             mockCommand.Setup(cmd => cmd.Parameters.AddWithValue("@additional_conditions", initialCondition.AdditionalConditions ?? (object)DBNull.Value));

//             mockCommand.Setup(cmd => cmd.ExecuteNonQueryAsync(cancellationToken))
//                 .ReturnsAsync(1);

//             // Act
//             var createdInitialCondition = await _service.CreateInitialConditionAsync(initialCondition);

//             // Assert
//             createdInitialCondition.Should().NotBeNull();
//             createdInitialCondition.Id.Should().NotBeEmpty();
//             createdInitialCondition.MechanismId.Should().Be(initialCondition.MechanismId);
//             createdInitialCondition.SpeciesId.Should().Be(initialCondition.SpeciesId);
//             createdInitialCondition.Concentration.Should().Be(2.5);
//             createdInitialCondition.Temperature.Should().Be(310.0);
//             createdInitialCondition.Pressure.Should().BeNull();
//             createdInitialCondition.AdditionalConditions.Should().Be("Some conditions");

//             // Verify interactions
//             mockCommand.VerifySet(cmd => cmd.CommandText = @"
//                     INSERT INTO initial_conditions_species 
//                     (id, mechanism_id, species_id, concentration, temperature, pressure, additional_conditions)
//                     VALUES (@id, @mechanism_id, @species_id, @concentration, @temperature, @pressure, @additional_conditions);", Times.Once);

//             mockCommand.Verify(cmd => cmd.Parameters.AddWithValue("@id", It.IsAny<Guid>()), Times.Once);
//             mockCommand.Verify(cmd => cmd.Parameters.AddWithValue("@mechanism_id", initialCondition.MechanismId), Times.Once);
//             mockCommand.Verify(cmd => cmd.Parameters.AddWithValue("@species_id", initialCondition.SpeciesId), Times.Once);
//             mockCommand.Verify(cmd => cmd.Parameters.AddWithValue("@concentration", initialCondition.Concentration ?? (object)DBNull.Value), Times.Once);
//             mockCommand.Verify(cmd => cmd.Parameters.AddWithValue("@temperature", initialCondition.Temperature ?? (object)DBNull.Value), Times.Once);
//             mockCommand.Verify(cmd => cmd.Parameters.AddWithValue("@pressure", initialCondition.Pressure ?? (object)DBNull.Value), Times.Once);
//             mockCommand.Verify(cmd => cmd.Parameters.AddWithValue("@additional_conditions", initialCondition.AdditionalConditions ?? (object)DBNull.Value), Times.Once);
//             mockCommand.Verify(cmd => cmd.ExecuteNonQueryAsync(cancellationToken), Times.Once);
//         }

//         [Fact]
//         public async Task UpdateInitialConditionAsync_ShouldExecuteUpdateCommand()
//         {
//             // Arrange
//             var initialCondition = new InitialConditionsSpecies
//             {
//                 Id = Guid.NewGuid(),
//                 MechanismId = Guid.NewGuid(),
//                 SpeciesId = Guid.NewGuid(),
//                 Concentration = 3.0,
//                 Temperature = 320.0,
//                 Pressure = 1.5,
//                 AdditionalConditions = "Updated conditions"
//             };

//             var mockConnection = new Mock<MySqlConnection>();
//             var mockCommand = new Mock<MySqlCommand>();
//             var cancellationToken = CancellationToken.None;

//             _mockDataSource.Setup(ds => ds.OpenConnectionAsync(It.IsAny<CancellationToken>()))
//                 .ReturnsAsync(mockConnection.Object);

//             mockConnection.Setup(c => c.CreateCommand())
//                 .Returns(mockCommand.Object);

//             // Setup property
//             mockCommand.SetupProperty(cmd => cmd.CommandText, string.Empty);

//             // Setup parameters
//             mockCommand.Setup(cmd => cmd.Parameters.AddWithValue("@id", initialCondition.Id));
//             mockCommand.Setup(cmd => cmd.Parameters.AddWithValue("@concentration", initialCondition.Concentration ?? (object)DBNull.Value));
//             mockCommand.Setup(cmd => cmd.Parameters.AddWithValue("@temperature", initialCondition.Temperature ?? (object)DBNull.Value));
//             mockCommand.Setup(cmd => cmd.Parameters.AddWithValue("@pressure", initialCondition.Pressure ?? (object)DBNull.Value));
//             mockCommand.Setup(cmd => cmd.Parameters.AddWithValue("@additional_conditions", initialCondition.AdditionalConditions ?? (object)DBNull.Value));

//             mockCommand.Setup(cmd => cmd.ExecuteNonQueryAsync(cancellationToken))
//                 .ReturnsAsync(1);

//             // Act
//             await _service.UpdateInitialConditionAsync(initialCondition);

//             // Assert
//             // Verify that CommandText was set correctly
//             mockCommand.VerifySet(cmd => cmd.CommandText = @"
//                     UPDATE initial_conditions_species 
//                     SET concentration = @concentration, 
//                         temperature = @temperature, 
//                         pressure = @pressure, 
//                         additional_conditions = @additional_conditions
//                     WHERE id = @id;", Times.Once);

//             // Verify that parameters were added
//             mockCommand.Verify(cmd => cmd.Parameters.AddWithValue("@id", initialCondition.Id), Times.Once);
//             mockCommand.Verify(cmd => cmd.Parameters.AddWithValue("@concentration", initialCondition.Concentration ?? (object)DBNull.Value), Times.Once);
//             mockCommand.Verify(cmd => cmd.Parameters.AddWithValue("@temperature", initialCondition.Temperature ?? (object)DBNull.Value), Times.Once);
//             mockCommand.Verify(cmd => cmd.Parameters.AddWithValue("@pressure", initialCondition.Pressure ?? (object)DBNull.Value), Times.Once);
//             mockCommand.Verify(cmd => cmd.Parameters.AddWithValue("@additional_conditions", initialCondition.AdditionalConditions ?? (object)DBNull.Value), Times.Once);

//             // Verify that ExecuteNonQueryAsync was called once
//             mockCommand.Verify(cmd => cmd.ExecuteNonQueryAsync(cancellationToken), Times.Once);
//         }

//         [Fact]
//         public async Task DeleteInitialConditionAsync_ShouldExecuteDeleteCommand()
//         {
//             // Arrange
//             var initialConditionId = Guid.NewGuid();
//             var mockConnection = new Mock<MySqlConnection>();
//             var mockCommand = new Mock<MySqlCommand>();
//             var cancellationToken = CancellationToken.None;

//             _mockDataSource.Setup(ds => ds.OpenConnectionAsync(It.IsAny<CancellationToken>()))
//                 .ReturnsAsync(mockConnection.Object);

//             mockConnection.Setup(c => c.CreateCommand())
//                 .Returns(mockCommand.Object);

//             // Setup property
//             mockCommand.SetupProperty(cmd => cmd.CommandText, string.Empty);

//             // Setup parameters
//             mockCommand.Setup(cmd => cmd.Parameters.AddWithValue("@id", initialConditionId));

//             mockCommand.Setup(cmd => cmd.ExecuteNonQueryAsync(cancellationToken))
//                 .ReturnsAsync(1);

//             // Act
//             await _service.DeleteInitialConditionAsync(initialConditionId);

//             // Assert
//             // Verify that CommandText was set correctly
//             mockCommand.VerifySet(cmd => cmd.CommandText = "DELETE FROM initial_conditions_species WHERE id = @id", Times.Once);

//             // Verify that parameters were added
//             mockCommand.Verify(cmd => cmd.Parameters.AddWithValue("@id", initialConditionId), Times.Once);

//             // Verify that ExecuteNonQueryAsync was called once
//             mockCommand.Verify(cmd => cmd.ExecuteNonQueryAsync(cancellationToken), Times.Once);
//         }
//     }
// }
