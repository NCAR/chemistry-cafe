using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ChemistryCafeAPI.Migrations
{
    /// <inheritdoc />
    public partial class FullDataModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MechanismReactions_Mechanisms_MechanismId",
                table: "MechanismReactions");

            migrationBuilder.DropForeignKey(
                name: "FK_MechanismReactions_Reactions_ReactionId",
                table: "MechanismReactions");

            migrationBuilder.DropForeignKey(
                name: "FK_Phases_Mechanisms_MechanismId",
                table: "Phases");

            migrationBuilder.DropForeignKey(
                name: "FK_Species_Phases_PhaseId",
                table: "Species");

            migrationBuilder.DropIndex(
                name: "IX_Species_PhaseId",
                table: "Species");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Reactants",
                table: "Reactants");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Products",
                table: "Products");

            migrationBuilder.DropPrimaryKey(
                name: "PK_MechanismReactions",
                table: "MechanismReactions");

            migrationBuilder.DropColumn(
                name: "Attributes",
                table: "Species");

            migrationBuilder.DropColumn(
                name: "PhaseId",
                table: "Species");

            migrationBuilder.DropColumn(
                name: "Id",
                table: "Reactants");

            migrationBuilder.DropColumn(
                name: "Id",
                table: "Products");

            migrationBuilder.RenameTable(
                name: "MechanismReactions",
                newName: "MechanismReaction");

            migrationBuilder.RenameColumn(
                name: "MechanismId",
                table: "Phases",
                newName: "FamilyId");

            migrationBuilder.RenameIndex(
                name: "IX_Phases_MechanismId",
                table: "Phases",
                newName: "IX_Phases_FamilyId");

            migrationBuilder.RenameIndex(
                name: "IX_MechanismReactions_ReactionId",
                table: "MechanismReaction",
                newName: "IX_MechanismReaction_ReactionId");

            migrationBuilder.AddColumn<Guid>(
                name: "AerosolPhaseId",
                table: "Reactions",
                type: "char(36)",
                nullable: true,
                collation: "ascii_general_ci");

            migrationBuilder.AddColumn<Guid>(
                name: "AerosolPhaseSpeciesId",
                table: "Reactions",
                type: "char(36)",
                nullable: true,
                collation: "ascii_general_ci");

            migrationBuilder.AddColumn<Guid>(
                name: "AerosolPhaseWaterId",
                table: "Reactions",
                type: "char(36)",
                nullable: true,
                collation: "ascii_general_ci");

            migrationBuilder.AddColumn<Guid>(
                name: "GasPhaseId",
                table: "Reactions",
                type: "char(36)",
                nullable: true,
                collation: "ascii_general_ci");

            migrationBuilder.AddColumn<Guid>(
                name: "GasPhaseSpeciesId",
                table: "Reactions",
                type: "char(36)",
                nullable: true,
                collation: "ascii_general_ci");

            migrationBuilder.AddColumn<string>(
                name: "ReactionType",
                table: "Reactions",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<double>(
                name: "Coefficient",
                table: "Reactants",
                type: "double",
                nullable: false,
                defaultValue: 0.0,
                oldClrType: typeof(double),
                oldType: "double",
                oldNullable: true);

            migrationBuilder.AlterColumn<double>(
                name: "Coefficient",
                table: "Products",
                type: "double",
                nullable: false,
                defaultValue: 0.0,
                oldClrType: typeof(double),
                oldType: "double",
                oldNullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_Reactants",
                table: "Reactants",
                columns: new[] { "ReactionId", "SpeciesId" });

            migrationBuilder.AddPrimaryKey(
                name: "PK_Products",
                table: "Products",
                columns: new[] { "ReactionId", "SpeciesId" });

            migrationBuilder.AddPrimaryKey(
                name: "PK_MechanismReaction",
                table: "MechanismReaction",
                columns: new[] { "MechanismId", "ReactionId" });

            migrationBuilder.CreateTable(
                name: "MechanismPhase",
                columns: table => new
                {
                    MechanismId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    PhaseId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MechanismPhase", x => new { x.MechanismId, x.PhaseId });
                    table.ForeignKey(
                        name: "FK_MechanismPhase_Mechanisms_MechanismId",
                        column: x => x.MechanismId,
                        principalTable: "Mechanisms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MechanismPhase_Phases_PhaseId",
                        column: x => x.PhaseId,
                        principalTable: "Phases",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "PhaseSpecies",
                columns: table => new
                {
                    PhasesId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    SpeciesId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PhaseSpecies", x => new { x.PhasesId, x.SpeciesId });
                    table.ForeignKey(
                        name: "FK_PhaseSpecies_Phases_PhasesId",
                        column: x => x.PhasesId,
                        principalTable: "Phases",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PhaseSpecies_Species_SpeciesId",
                        column: x => x.SpeciesId,
                        principalTable: "Species",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "ReactionNumericalAttributes",
                columns: table => new
                {
                    ReactionId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    SerializationKey = table.Column<string>(type: "varchar(255)", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Value = table.Column<double>(type: "double", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReactionNumericalAttributes", x => new { x.ReactionId, x.SerializationKey });
                    table.ForeignKey(
                        name: "FK_ReactionNumericalAttributes_Reactions_ReactionId",
                        column: x => x.ReactionId,
                        principalTable: "Reactions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "ReactionStringAttributes",
                columns: table => new
                {
                    ReactionId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    SerializationKey = table.Column<string>(type: "varchar(255)", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Value = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReactionStringAttributes", x => new { x.ReactionId, x.SerializationKey });
                    table.ForeignKey(
                        name: "FK_ReactionStringAttributes_Reactions_ReactionId",
                        column: x => x.ReactionId,
                        principalTable: "Reactions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "SpeciesNumericalAttributes",
                columns: table => new
                {
                    SpeciesId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    SerializationKey = table.Column<string>(type: "varchar(255)", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Value = table.Column<double>(type: "double", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SpeciesNumericalAttributes", x => new { x.SpeciesId, x.SerializationKey });
                    table.ForeignKey(
                        name: "FK_SpeciesNumericalAttributes_Species_SpeciesId",
                        column: x => x.SpeciesId,
                        principalTable: "Species",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_Reactions_AerosolPhaseId",
                table: "Reactions",
                column: "AerosolPhaseId");

            migrationBuilder.CreateIndex(
                name: "IX_Reactions_AerosolPhaseSpeciesId",
                table: "Reactions",
                column: "AerosolPhaseSpeciesId");

            migrationBuilder.CreateIndex(
                name: "IX_Reactions_AerosolPhaseWaterId",
                table: "Reactions",
                column: "AerosolPhaseWaterId");

            migrationBuilder.CreateIndex(
                name: "IX_Reactions_GasPhaseId",
                table: "Reactions",
                column: "GasPhaseId");

            migrationBuilder.CreateIndex(
                name: "IX_Reactions_GasPhaseSpeciesId",
                table: "Reactions",
                column: "GasPhaseSpeciesId");

            migrationBuilder.CreateIndex(
                name: "IX_MechanismPhase_PhaseId",
                table: "MechanismPhase",
                column: "PhaseId");

            migrationBuilder.CreateIndex(
                name: "IX_PhaseSpecies_SpeciesId",
                table: "PhaseSpecies",
                column: "SpeciesId");

            migrationBuilder.AddForeignKey(
                name: "FK_MechanismReaction_Mechanisms_MechanismId",
                table: "MechanismReaction",
                column: "MechanismId",
                principalTable: "Mechanisms",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_MechanismReaction_Reactions_ReactionId",
                table: "MechanismReaction",
                column: "ReactionId",
                principalTable: "Reactions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Phases_Families_FamilyId",
                table: "Phases",
                column: "FamilyId",
                principalTable: "Families",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Reactions_Phases_AerosolPhaseId",
                table: "Reactions",
                column: "AerosolPhaseId",
                principalTable: "Phases",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Reactions_Phases_GasPhaseId",
                table: "Reactions",
                column: "GasPhaseId",
                principalTable: "Phases",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Reactions_Species_AerosolPhaseSpeciesId",
                table: "Reactions",
                column: "AerosolPhaseSpeciesId",
                principalTable: "Species",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Reactions_Species_AerosolPhaseWaterId",
                table: "Reactions",
                column: "AerosolPhaseWaterId",
                principalTable: "Species",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Reactions_Species_GasPhaseSpeciesId",
                table: "Reactions",
                column: "GasPhaseSpeciesId",
                principalTable: "Species",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MechanismReaction_Mechanisms_MechanismId",
                table: "MechanismReaction");

            migrationBuilder.DropForeignKey(
                name: "FK_MechanismReaction_Reactions_ReactionId",
                table: "MechanismReaction");

            migrationBuilder.DropForeignKey(
                name: "FK_Phases_Families_FamilyId",
                table: "Phases");

            migrationBuilder.DropForeignKey(
                name: "FK_Reactions_Phases_AerosolPhaseId",
                table: "Reactions");

            migrationBuilder.DropForeignKey(
                name: "FK_Reactions_Phases_GasPhaseId",
                table: "Reactions");

            migrationBuilder.DropForeignKey(
                name: "FK_Reactions_Species_AerosolPhaseSpeciesId",
                table: "Reactions");

            migrationBuilder.DropForeignKey(
                name: "FK_Reactions_Species_AerosolPhaseWaterId",
                table: "Reactions");

            migrationBuilder.DropForeignKey(
                name: "FK_Reactions_Species_GasPhaseSpeciesId",
                table: "Reactions");

            migrationBuilder.DropTable(
                name: "MechanismPhase");

            migrationBuilder.DropTable(
                name: "PhaseSpecies");

            migrationBuilder.DropTable(
                name: "ReactionNumericalAttributes");

            migrationBuilder.DropTable(
                name: "ReactionStringAttributes");

            migrationBuilder.DropTable(
                name: "SpeciesNumericalAttributes");

            migrationBuilder.DropIndex(
                name: "IX_Reactions_AerosolPhaseId",
                table: "Reactions");

            migrationBuilder.DropIndex(
                name: "IX_Reactions_AerosolPhaseSpeciesId",
                table: "Reactions");

            migrationBuilder.DropIndex(
                name: "IX_Reactions_AerosolPhaseWaterId",
                table: "Reactions");

            migrationBuilder.DropIndex(
                name: "IX_Reactions_GasPhaseId",
                table: "Reactions");

            migrationBuilder.DropIndex(
                name: "IX_Reactions_GasPhaseSpeciesId",
                table: "Reactions");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Reactants",
                table: "Reactants");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Products",
                table: "Products");

            migrationBuilder.DropPrimaryKey(
                name: "PK_MechanismReaction",
                table: "MechanismReaction");

            migrationBuilder.DropColumn(
                name: "AerosolPhaseId",
                table: "Reactions");

            migrationBuilder.DropColumn(
                name: "AerosolPhaseSpeciesId",
                table: "Reactions");

            migrationBuilder.DropColumn(
                name: "AerosolPhaseWaterId",
                table: "Reactions");

            migrationBuilder.DropColumn(
                name: "GasPhaseId",
                table: "Reactions");

            migrationBuilder.DropColumn(
                name: "GasPhaseSpeciesId",
                table: "Reactions");

            migrationBuilder.DropColumn(
                name: "ReactionType",
                table: "Reactions");

            migrationBuilder.RenameTable(
                name: "MechanismReaction",
                newName: "MechanismReactions");

            migrationBuilder.RenameColumn(
                name: "FamilyId",
                table: "Phases",
                newName: "MechanismId");

            migrationBuilder.RenameIndex(
                name: "IX_Phases_FamilyId",
                table: "Phases",
                newName: "IX_Phases_MechanismId");

            migrationBuilder.RenameIndex(
                name: "IX_MechanismReaction_ReactionId",
                table: "MechanismReactions",
                newName: "IX_MechanismReactions_ReactionId");

            migrationBuilder.AddColumn<string>(
                name: "Attributes",
                table: "Species",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<Guid>(
                name: "PhaseId",
                table: "Species",
                type: "char(36)",
                nullable: true,
                collation: "ascii_general_ci");

            migrationBuilder.AlterColumn<double>(
                name: "Coefficient",
                table: "Reactants",
                type: "double",
                nullable: true,
                oldClrType: typeof(double),
                oldType: "double");

            migrationBuilder.AddColumn<Guid>(
                name: "Id",
                table: "Reactants",
                type: "char(36)",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                collation: "ascii_general_ci");

            migrationBuilder.AlterColumn<double>(
                name: "Coefficient",
                table: "Products",
                type: "double",
                nullable: true,
                oldClrType: typeof(double),
                oldType: "double");

            migrationBuilder.AddColumn<Guid>(
                name: "Id",
                table: "Products",
                type: "char(36)",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                collation: "ascii_general_ci");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Reactants",
                table: "Reactants",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Products",
                table: "Products",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_MechanismReactions",
                table: "MechanismReactions",
                columns: new[] { "MechanismId", "ReactionId" });

            migrationBuilder.CreateIndex(
                name: "IX_Species_PhaseId",
                table: "Species",
                column: "PhaseId");

            migrationBuilder.CreateIndex(
                name: "IX_Reactants_ReactionId",
                table: "Reactants",
                column: "ReactionId");

            migrationBuilder.CreateIndex(
                name: "IX_Products_ReactionId",
                table: "Products",
                column: "ReactionId");

            migrationBuilder.AddForeignKey(
                name: "FK_MechanismReactions_Mechanisms_MechanismId",
                table: "MechanismReactions",
                column: "MechanismId",
                principalTable: "Mechanisms",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_MechanismReactions_Reactions_ReactionId",
                table: "MechanismReactions",
                column: "ReactionId",
                principalTable: "Reactions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Phases_Mechanisms_MechanismId",
                table: "Phases",
                column: "MechanismId",
                principalTable: "Mechanisms",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Species_Phases_PhaseId",
                table: "Species",
                column: "PhaseId",
                principalTable: "Phases",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }
    }
}
