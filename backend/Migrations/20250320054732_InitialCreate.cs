using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ChemistryCafeAPI.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    Username = table.Column<string>(type: "varchar(255)", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Role = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Email = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CreatedDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    GoogleId = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Families",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    Name = table.Column<string>(type: "varchar(255)", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Description = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    OwnerId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    CreatedDate = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    IsPublic = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    UserId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Families", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Families_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Mechanisms",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    FamilyId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    Name = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Description = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CreatedBy = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CreatedDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    SpeciesIds = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ReactionIds = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Mechanisms", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Mechanisms_Families_FamilyId",
                        column: x => x.FamilyId,
                        principalTable: "Families",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Reactions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    FamilyId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    Name = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Description = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CreatedBy = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CreatedDate = table.Column<DateTime>(type: "datetime(6)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Reactions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Reactions_Families_FamilyId",
                        column: x => x.FamilyId,
                        principalTable: "Families",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Species",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    FamilyId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    Name = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Description = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CreatedBy = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CreatedDate = table.Column<DateTime>(type: "datetime(6)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Species", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Species_Families_FamilyId",
                        column: x => x.FamilyId,
                        principalTable: "Families",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "ReactionComponent",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    ReactionId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    SpeciesId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    Type = table.Column<int>(type: "int", nullable: false),
                    Coefficient = table.Column<double>(type: "double", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReactionComponent", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ReactionComponent_Reactions_ReactionId",
                        column: x => x.ReactionId,
                        principalTable: "Reactions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "InitialConditions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    SpeciesId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    Concentration = table.Column<double>(type: "double", nullable: true),
                    Temperature = table.Column<double>(type: "double", nullable: true),
                    Pressure = table.Column<double>(type: "double", nullable: true),
                    AdditionalConditions = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    AbsConvergenceTolerance = table.Column<double>(type: "double", nullable: true),
                    DiffusionCoefficient = table.Column<double>(type: "double", nullable: true),
                    MolecularWeight = table.Column<double>(type: "double", nullable: true),
                    FixedConcentration = table.Column<double>(type: "double", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InitialConditions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InitialConditions_Species_SpeciesId",
                        column: x => x.SpeciesId,
                        principalTable: "Species",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Properties",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    SpeciesId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    Tolerance = table.Column<double>(type: "double", nullable: true),
                    Weight = table.Column<double>(type: "double", nullable: true),
                    Concentration = table.Column<double>(type: "double", nullable: true),
                    Diffusion = table.Column<double>(type: "double", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Properties", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Properties_Species_SpeciesId",
                        column: x => x.SpeciesId,
                        principalTable: "Species",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.InsertData(
                table: "Families",
                columns: new[] { "Id", "CreatedDate", "Description", "IsPublic", "Name", "OwnerId", "UserId" },
                values: new object[] { new Guid("22222222-2222-2222-2222-222222222222"), new DateTime(2025, 3, 20, 5, 47, 32, 35, DateTimeKind.Utc).AddTicks(2650), "Water is a chemical compound with the formula H2O. It is a transparent, tasteless, odorless, and nearly colorless chemical substance, and it is the main constituent of Earth's hydrosphere and the fluids of all known living organisms.", true, "Water", new Guid("11111111-1111-1111-1111-111111111111"), null });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "CreatedDate", "Email", "GoogleId", "Role", "Username" },
                values: new object[] { new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2025, 3, 20, 5, 47, 32, 35, DateTimeKind.Utc).AddTicks(2490), "jackson.stewart@tamu.edu", null, "admin", "jackson.stewart" });

            migrationBuilder.InsertData(
                table: "Mechanisms",
                columns: new[] { "Id", "CreatedBy", "CreatedDate", "Description", "FamilyId", "Name", "ReactionIds", "SpeciesIds" },
                values: new object[] { new Guid("66666666-6666-6666-6666-666666666666"), null, new DateTime(2025, 3, 20, 5, 47, 32, 35, DateTimeKind.Utc).AddTicks(2630), "Rocket Launch", new Guid("22222222-2222-2222-2222-222222222222"), "Rocket Launch", "[]", "[]" });

            migrationBuilder.InsertData(
                table: "Reactions",
                columns: new[] { "Id", "CreatedBy", "CreatedDate", "Description", "FamilyId", "Name" },
                values: new object[] { new Guid("55555555-5555-5555-5555-555555555555"), null, new DateTime(2025, 3, 20, 5, 47, 32, 35, DateTimeKind.Utc).AddTicks(2610), null, new Guid("22222222-2222-2222-2222-222222222222"), "Hydrogen Combustion" });

            migrationBuilder.InsertData(
                table: "Species",
                columns: new[] { "Id", "CreatedBy", "CreatedDate", "Description", "FamilyId", "Name" },
                values: new object[,]
                {
                    { new Guid("33333333-3333-3333-3333-333333333333"), null, new DateTime(2025, 3, 20, 5, 47, 32, 35, DateTimeKind.Utc).AddTicks(2580), null, new Guid("22222222-2222-2222-2222-222222222222"), "H2O" },
                    { new Guid("44444444-4444-4444-4444-444444444444"), null, new DateTime(2025, 3, 20, 5, 47, 32, 35, DateTimeKind.Utc).AddTicks(2590), null, new Guid("22222222-2222-2222-2222-222222222222"), "H2" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Families_Name",
                table: "Families",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Families_UserId",
                table: "Families",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_InitialConditions_SpeciesId",
                table: "InitialConditions",
                column: "SpeciesId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Mechanisms_FamilyId",
                table: "Mechanisms",
                column: "FamilyId");

            migrationBuilder.CreateIndex(
                name: "IX_Properties_SpeciesId",
                table: "Properties",
                column: "SpeciesId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ReactionComponent_ReactionId",
                table: "ReactionComponent",
                column: "ReactionId");

            migrationBuilder.CreateIndex(
                name: "IX_Reactions_FamilyId",
                table: "Reactions",
                column: "FamilyId");

            migrationBuilder.CreateIndex(
                name: "IX_Species_FamilyId",
                table: "Species",
                column: "FamilyId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Username",
                table: "Users",
                column: "Username",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "InitialConditions");

            migrationBuilder.DropTable(
                name: "Mechanisms");

            migrationBuilder.DropTable(
                name: "Properties");

            migrationBuilder.DropTable(
                name: "ReactionComponent");

            migrationBuilder.DropTable(
                name: "Species");

            migrationBuilder.DropTable(
                name: "Reactions");

            migrationBuilder.DropTable(
                name: "Families");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
