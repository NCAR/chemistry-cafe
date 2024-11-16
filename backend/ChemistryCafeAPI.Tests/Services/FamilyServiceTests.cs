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
//     public class FamilyServiceTests
//     {
//         private readonly Mock<MySqlDataSource> _mockDataSource;
//         private readonly FamilyService _familyService;

//         public FamilyServiceTests()
//         {
//             _mockDataSource = new Mock<MySqlDataSource>();
//             _familyService = new FamilyService(_mockDataSource.Object);
//         }

//         [Fact]
//         public async Task GetFamiliesAsync_ShouldReturnListOfFamiliesWithMechanisms()
//         {
//             // Arrange
//             var mockConnection = new Mock<MySqlConnection>();
//            var mockCommand = new Mock<MySqlCommand>();
//             var mockReader = new Mock<DbDataReader>().As<MySqlDataReader>();
//             var cancellationToken = new CancellationToken();

//             _mockDataSource.Setup(ds => ds.OpenConnectionAsync(It.IsAny<CancellationToken>()))
//                 .ReturnsAsync(mockConnection.Object);

//             mockConnection.Setup(c => c.CreateCommand())
//                 .Returns(mockCommand.Object);

//             mockCommand.SetupSet(cmd => cmd.CommandText = It.IsAny<string>());
//           mockCommand.Setup(cmd => cmd.ExecuteReaderAsync(cancellationToken))
//             .ReturnsAsync((MySqlDataReader) mockReader.Object);

//             // Setup the reader to simulate two families, each with one mechanism
//             var readSequence = new Queue<bool>(new[] { true, true, false });
//             mockReader.Setup(r => r.ReadAsync(It.IsAny<CancellationToken>()))
//                 .ReturnsAsync(() => readSequence.Dequeue());

//             // Use variables to hold the family and mechanism IDs
//             var familyId1 = Guid.NewGuid();
//             var mechanismId1 = Guid.NewGuid();
//             var familyId2 = Guid.NewGuid();

//             // First Family
//             mockReader.Setup(r => r.GetGuid(r.GetOrdinal("FamilyId")))
//                 .Returns(familyId1);

//             mockReader.Setup(r => r.GetString(r.GetOrdinal("FamilyName")))
//                 .Returns("Family A");

//             mockReader.Setup(r => r.IsDBNull(r.GetOrdinal("FamilyDescription")))
//                 .Returns(false);

//             mockReader.Setup(r => r.GetString(r.GetOrdinal("FamilyDescription")))
//                 .Returns("Description A");

//             mockReader.Setup(r => r.IsDBNull(r.GetOrdinal("FamilyCreatedBy")))
//                 .Returns(false);

//             mockReader.Setup(r => r.GetString(r.GetOrdinal("FamilyCreatedBy")))
//                 .Returns("creatorA");

//             mockReader.Setup(r => r.GetDateTime(r.GetOrdinal("FamilyCreatedDate")))
//                 .Returns(DateTime.UtcNow);

//             // Mechanism for first family
//             mockReader.Setup(r => r.IsDBNull(r.GetOrdinal("MechanismId")))
//                 .Returns(false);

//             mockReader.Setup(r => r.GetGuid(r.GetOrdinal("MechanismId")))
//                 .Returns(mechanismId1);

//             mockReader.Setup(r => r.GetGuid(r.GetOrdinal("MechanismFamilyId")))
//                 .Returns(familyId1);

//             mockReader.Setup(r => r.GetString(r.GetOrdinal("MechanismName")))
//                 .Returns("Mechanism A1");

//             mockReader.Setup(r => r.IsDBNull(r.GetOrdinal("MechanismDescription")))
//                 .Returns(true);

//             mockReader.Setup(r => r.GetString(r.GetOrdinal("MechanismCreatedBy")))
//                 .Returns("creatorA1");

//             mockReader.Setup(r => r.GetDateTime(r.GetOrdinal("MechanismCreatedDate")))
//                 .Returns(DateTime.UtcNow);

//             // Second Family
//             mockReader.Setup(r => r.GetGuid(r.GetOrdinal("FamilyId")))
//                 .Returns(familyId2);

//             mockReader.Setup(r => r.GetString(r.GetOrdinal("FamilyName")))
//                 .Returns("Family B");

//             mockReader.Setup(r => r.IsDBNull(r.GetOrdinal("FamilyDescription")))
//                 .Returns(true);

//             mockReader.Setup(r => r.GetString(r.GetOrdinal("FamilyDescription")))
//                 .Returns(string.Empty);

//             mockReader.Setup(r => r.IsDBNull(r.GetOrdinal("FamilyCreatedBy")))
//                 .Returns(true);

//             mockReader.Setup(r => r.GetString(r.GetOrdinal("FamilyCreatedBy")))
//                 .Returns(string.Empty);

//             mockReader.Setup(r => r.GetDateTime(r.GetOrdinal("FamilyCreatedDate")))
//                 .Returns(DateTime.MinValue);

//             // Mechanism for second family
//             mockReader.Setup(r => r.IsDBNull(r.GetOrdinal("MechanismId")))
//                 .Returns(true); // No mechanisms

//             // Act
//             var families = await _familyService.GetFamiliesAsync();

//             // Assert
//             families.Should().NotBeNull();
//             families.Should().HaveCount(2);

//             var familyA = families.FirstOrDefault(f => f.Name == "Family A");
//             var familyB = families.FirstOrDefault(f => f.Name == "Family B");

//             familyA.Should().NotBeNull();
//             familyA!.Mechanisms.Should().HaveCount(1);
//             familyA.Mechanisms.ToList()[0].Name.Should().Be("Mechanism A1");

//             familyB.Should().NotBeNull();
//             familyB!.Mechanisms.Should().BeEmpty();

//             // Verify interactions
//             mockCommand.VerifySet(cmd => cmd.CommandText = It.IsAny<string>(), Times.Once);
//             mockCommand.Verify(cmd => cmd.ExecuteReaderAsync(CancellationToken.None), Times.Once);
//             mockReader.Verify(r => r.ReadAsync(It.IsAny<CancellationToken>()), Times.Exactly(3)); // 2 reads + 1 false
//         }

//         [Fact]
//         public async Task GetFamilyAsync_ShouldReturnFamily_WhenFamilyExists()
//         {
//             // Arrange
//             var familyId = Guid.NewGuid();
//              var mockConnection = new Mock<MySqlConnection>();
//            var mockCommand = new Mock<MySqlCommand>();
//             var mockReader = new Mock<DbDataReader>().As<MySqlDataReader>();
//             var cancellationToken = new CancellationToken();

//             _mockDataSource.Setup(ds => ds.OpenConnectionAsync(It.IsAny<CancellationToken>()))
//                 .ReturnsAsync(mockConnection.Object);

//             mockConnection.Setup(c => c.CreateCommand())
//                 .Returns(mockCommand.Object);

//             mockCommand.SetupSet(cmd => cmd.CommandText = It.IsAny<string>());
//             mockCommand.Setup(cmd => cmd.Parameters.AddWithValue("@id", familyId));
//              mockCommand.Setup(cmd => cmd.ExecuteReaderAsync(cancellationToken))
//             .ReturnsAsync((MySqlDataReader) mockReader.Object);

//             var readSequence = new Queue<bool>(new[] { true, false });
//             mockReader.Setup(r => r.ReadAsync(It.IsAny<CancellationToken>()))
//                 .ReturnsAsync(() => readSequence.Dequeue());

//             mockReader.Setup(r => r.GetGuid(r.GetOrdinal("id")))
//                 .Returns(familyId);

//             mockReader.Setup(r => r.GetString(r.GetOrdinal("name")))
//                 .Returns("Family A");

//             mockReader.Setup(r => r.IsDBNull(r.GetOrdinal("description")))
//                 .Returns(false);

//             mockReader.Setup(r => r.GetString(r.GetOrdinal("description")))
//                 .Returns("Description A");

//             mockReader.Setup(r => r.IsDBNull(r.GetOrdinal("created_by")))
//                 .Returns(false);

//             mockReader.Setup(r => r.GetString(r.GetOrdinal("created_by")))
//                 .Returns("creatorA");

//             mockReader.Setup(r => r.GetDateTime(r.GetOrdinal("created_date")))
//                 .Returns(DateTime.UtcNow);

//             // Act
//             var family = await _familyService.GetFamilyAsync(familyId);

//             // Assert
//             family.Should().NotBeNull();
//             family!.Id.Should().Be(familyId);
//             family.Name.Should().Be("Family A");
//             family.Description.Should().Be("Description A");
//             family.CreatedBy.Should().Be("creatorA");

//             mockCommand.VerifySet(cmd => cmd.CommandText = It.IsAny<string>(), Times.Once);
//             mockCommand.Verify(cmd => cmd.Parameters.AddWithValue("@id", familyId), Times.Once);
//             mockCommand.Verify(cmd => cmd.ExecuteReaderAsync(CancellationToken.None), Times.Once);
//             mockReader.Verify(r => r.ReadAsync(It.IsAny<CancellationToken>()), Times.Exactly(2));
//         }

//         [Fact]
//         public async Task GetFamilyAsync_ShouldReturnNull_WhenFamilyDoesNotExist()
//         {
//             // Arrange
//             var familyId = Guid.NewGuid();
//             var mockConnection = new Mock<MySqlConnection>();
//             var mockCommand = new Mock<MySqlCommand>();
//             var mockReader = new Mock<DbDataReader>();
//             var cancellationToken = new CancellationToken();

//             _mockDataSource.Setup(ds => ds.OpenConnectionAsync(It.IsAny<CancellationToken>()))
//                 .ReturnsAsync(mockConnection.Object);

//             mockConnection.Setup(c => c.CreateCommand())
//                 .Returns(mockCommand.Object);

//             mockCommand.SetupSet(cmd => cmd.CommandText = It.IsAny<string>());
//             mockCommand.Setup(cmd => cmd.Parameters.AddWithValue("@id", familyId));
//              mockCommand.Setup(cmd => cmd.ExecuteReaderAsync(cancellationToken))
//             .ReturnsAsync((MySqlDataReader) mockReader.Object);

//             mockReader.Setup(r => r.ReadAsync(It.IsAny<CancellationToken>()))
//                 .ReturnsAsync(false);

//             // Act
//             var family = await _familyService.GetFamilyAsync(familyId);

//             // Assert
//             family.Should().BeNull();

//             mockCommand.VerifySet(cmd => cmd.CommandText = It.IsAny<string>(), Times.Once);
//             mockCommand.Verify(cmd => cmd.Parameters.AddWithValue("@id", familyId), Times.Once);
//             mockCommand.Verify(cmd => cmd.ExecuteReaderAsync(CancellationToken.None), Times.Once);
//             mockReader.Verify(r => r.ReadAsync(It.IsAny<CancellationToken>()), Times.Once);
//         }

//         [Fact]
//         public async Task CreateFamilyAsync_ShouldInsertAndReturnNewFamily()
//         {
//             // Arrange
//             var name = "New Family";
//             string? description = "New Description";
//             string? createdBy = "creatorNew";

//             var mockConnection = new Mock<MySqlConnection>();
//             var mockCommand = new Mock<MySqlCommand>();

//             _mockDataSource.Setup(ds => ds.OpenConnectionAsync(It.IsAny<CancellationToken>()))
//                 .ReturnsAsync(mockConnection.Object);

//             mockConnection.Setup(c => c.CreateCommand())
//                 .Returns(mockCommand.Object);

//             mockCommand.SetupSet(cmd => cmd.CommandText = It.IsAny<string>());
//             mockCommand.Setup(cmd => cmd.Parameters.AddWithValue(It.IsAny<string>(), It.IsAny<object>()));
//             mockCommand.Setup(cmd => cmd.ExecuteNonQueryAsync(It.IsAny<CancellationToken>()))
//                 .ReturnsAsync(1);

//             // Act
//             var newFamily = await _familyService.CreateFamilyAsync(name, description, createdBy);

//             // Assert
//             newFamily.Should().NotBeNull();
//             newFamily.Name.Should().Be(name);
//             newFamily.Description.Should().Be(description);
//             newFamily.CreatedBy.Should().Be(createdBy);
//             newFamily.Id.Should().NotBeEmpty();
//             newFamily.CreatedDate.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));

//             mockCommand.VerifySet(cmd => cmd.CommandText = It.IsAny<string>(), Times.Once);
//             mockCommand.Verify(cmd => cmd.Parameters.AddWithValue("@id", newFamily.Id), Times.Once);
//             mockCommand.Verify(cmd => cmd.Parameters.AddWithValue("@name", name), Times.Once);
//             mockCommand.Verify(cmd => cmd.Parameters.AddWithValue("@description", description ?? (object)DBNull.Value), Times.Once);
//             mockCommand.Verify(cmd => cmd.Parameters.AddWithValue("@created_by", createdBy ?? (object)DBNull.Value), Times.Once);
//             mockCommand.Verify(cmd => cmd.ExecuteNonQueryAsync(It.IsAny<CancellationToken>()), Times.Once);
//         }

//         [Fact]
//         public async Task UpdateFamilyAsync_ShouldExecuteUpdateCommand()
//         {
//             // Arrange
//             var family = new Family
//             {
//                 Id = Guid.NewGuid(),
//                 Name = "Updated Family",
//                 Description = "Updated Description",
//                 CreatedBy = "updatedCreator"
//             };

//             var mockConnection = new Mock<MySqlConnection>();
//             var mockCommand = new Mock<MySqlCommand>();

//             _mockDataSource.Setup(ds => ds.OpenConnectionAsync(It.IsAny<CancellationToken>()))
//                 .ReturnsAsync(mockConnection.Object);

//             mockConnection.Setup(c => c.CreateCommand())
//                 .Returns(mockCommand.Object);

//             mockCommand.SetupSet(cmd => cmd.CommandText = It.IsAny<string>());
//             mockCommand.Setup(cmd => cmd.Parameters.AddWithValue(It.IsAny<string>(), It.IsAny<object>()));
//             mockCommand.Setup(cmd => cmd.ExecuteNonQueryAsync(It.IsAny<CancellationToken>()))
//                 .ReturnsAsync(1);

//             // Act
//             await _familyService.UpdateFamilyAsync(family);

//             // Assert
//             mockCommand.VerifySet(cmd => cmd.CommandText = It.IsAny<string>(), Times.Once);
//             mockCommand.Verify(cmd => cmd.Parameters.AddWithValue("@id", family.Id), Times.Once);
//             mockCommand.Verify(cmd => cmd.Parameters.AddWithValue("@name", family.Name), Times.Once);
//             mockCommand.Verify(cmd => cmd.Parameters.AddWithValue("@description", family.Description ?? (object)DBNull.Value), Times.Once);
//             mockCommand.Verify(cmd => cmd.Parameters.AddWithValue("@created_by", family.CreatedBy ?? (object)DBNull.Value), Times.Once);
//             mockCommand.Verify(cmd => cmd.ExecuteNonQueryAsync(It.IsAny<CancellationToken>()), Times.Once);
//         }

//         [Fact]
//         public async Task DeleteFamilyAsync_ShouldExecuteDeleteCommand()
//         {
//             // Arrange
//             var familyId = Guid.NewGuid();
//             var mockConnection = new Mock<MySqlConnection>();
//             var mockCommand = new Mock<MySqlCommand>();

//             _mockDataSource.Setup(ds => ds.OpenConnectionAsync(It.IsAny<CancellationToken>()))
//                 .ReturnsAsync(mockConnection.Object);

//             mockConnection.Setup(c => c.CreateCommand())
//                 .Returns(mockCommand.Object);

//             mockCommand.SetupSet(cmd => cmd.CommandText = It.IsAny<string>());
//             mockCommand.Setup(cmd => cmd.Parameters.AddWithValue("@id", familyId));
//             mockCommand.Setup(cmd => cmd.ExecuteNonQueryAsync(It.IsAny<CancellationToken>()))
//                 .ReturnsAsync(1);

//             // Act
//             await _familyService.DeleteFamilyAsync(familyId);

//             // Assert
//             mockCommand.VerifySet(cmd => cmd.CommandText = "DELETE FROM families WHERE id = @id;", Times.Once);
//             mockCommand.Verify(cmd => cmd.Parameters.AddWithValue("@id", familyId), Times.Once);
//             mockCommand.Verify(cmd => cmd.ExecuteNonQueryAsync(It.IsAny<CancellationToken>()), Times.Once);
//         }
//     }
// }
