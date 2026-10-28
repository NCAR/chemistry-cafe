using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ChemistryCafeAPI.Migrations
{
    /// <inheritdoc />
    public partial class RemoveReactionPhase : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                "UPDATE Reactions SET GasPhaseId = PhaseId WHERE GasPhaseId IS NULL AND PhaseId IS NOT NULL");

            migrationBuilder.DropForeignKey(
                name: "FK_Reactions_Phases_PhaseId",
                table: "Reactions");

            migrationBuilder.DropIndex(
                name: "IX_Reactions_PhaseId",
                table: "Reactions");

            migrationBuilder.DropColumn(
                name: "PhaseId",
                table: "Reactions");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "PhaseId",
                table: "Reactions",
                type: "char(36)",
                nullable: true,
                collation: "ascii_general_ci");

            migrationBuilder.CreateIndex(
                name: "IX_Reactions_PhaseId",
                table: "Reactions",
                column: "PhaseId");

            migrationBuilder.AddForeignKey(
                name: "FK_Reactions_Phases_PhaseId",
                table: "Reactions",
                column: "PhaseId",
                principalTable: "Phases",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }
    }
}
