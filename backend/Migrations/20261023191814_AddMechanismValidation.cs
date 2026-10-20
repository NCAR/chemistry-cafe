using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ChemistryCafeAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddMechanismValidation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ValidatedById",
                table: "Mechanisms",
                type: "char(36)",
                nullable: true,
                collation: "ascii_general_ci");

            migrationBuilder.AddColumn<int>(
                name: "ValidationStatus",
                table: "Mechanisms",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Mechanisms_ValidatedById",
                table: "Mechanisms",
                column: "ValidatedById");

            migrationBuilder.AddForeignKey(
                name: "FK_Mechanisms_Users_ValidatedById",
                table: "Mechanisms",
                column: "ValidatedById",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Mechanisms_Users_ValidatedById",
                table: "Mechanisms");

            migrationBuilder.DropIndex(
                name: "IX_Mechanisms_ValidatedById",
                table: "Mechanisms");

            migrationBuilder.DropColumn(
                name: "ValidatedById",
                table: "Mechanisms");

            migrationBuilder.DropColumn(
                name: "ValidationStatus",
                table: "Mechanisms");
        }
    }
}
