using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ChemistryCafeAPI.Migrations
{
    /// <inheritdoc />
    public partial class RemoveAerosolPhaseFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Reactions_Phases_AerosolPhaseId",
                table: "Reactions");

            migrationBuilder.DropForeignKey(
                name: "FK_Reactions_Species_AerosolPhaseSpeciesId",
                table: "Reactions");

            migrationBuilder.DropForeignKey(
                name: "FK_Reactions_Species_AerosolPhaseWaterId",
                table: "Reactions");

            migrationBuilder.DropIndex(
                name: "IX_Reactions_AerosolPhaseId",
                table: "Reactions");

            migrationBuilder.DropIndex(
                name: "IX_Reactions_AerosolPhaseSpeciesId",
                table: "Reactions");

            migrationBuilder.DropIndex(
                name: "IX_Reactions_AerosolPhaseWaterId",
                table: "Reactions");

            migrationBuilder.DropColumn(
                name: "AerosolPhaseId",
                table: "Reactions");

            migrationBuilder.DropColumn(
                name: "AerosolPhaseSpeciesId",
                table: "Reactions");

            migrationBuilder.DropColumn(
                name: "AerosolPhaseWaterId",
                table: "Reactions");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
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

            migrationBuilder.AddForeignKey(
                name: "FK_Reactions_Phases_AerosolPhaseId",
                table: "Reactions",
                column: "AerosolPhaseId",
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
        }
    }
}
