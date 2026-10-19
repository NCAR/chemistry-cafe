using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ChemistryCafeAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddFamilyVersion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Phases_Families_FamilyId",
                table: "Phases");

            migrationBuilder.DropForeignKey(
                name: "FK_Reactions_Families_FamilyId",
                table: "Reactions");

            migrationBuilder.DropForeignKey(
                name: "FK_Species_Families_FamilyId",
                table: "Species");

            migrationBuilder.RenameColumn(
                name: "FamilyId",
                table: "Species",
                newName: "FamilyVersionId");

            migrationBuilder.RenameIndex(
                name: "IX_Species_FamilyId",
                table: "Species",
                newName: "IX_Species_FamilyVersionId");

            migrationBuilder.RenameColumn(
                name: "FamilyId",
                table: "Reactions",
                newName: "FamilyVersionId");

            migrationBuilder.RenameIndex(
                name: "IX_Reactions_FamilyId",
                table: "Reactions",
                newName: "IX_Reactions_FamilyVersionId");

            migrationBuilder.RenameColumn(
                name: "FamilyId",
                table: "Phases",
                newName: "FamilyVersionId");

            migrationBuilder.RenameIndex(
                name: "IX_Phases_FamilyId",
                table: "Phases",
                newName: "IX_Phases_FamilyVersionId");

            migrationBuilder.AddColumn<Guid>(
                name: "FamilyVersionId",
                table: "Mechanisms",
                type: "char(36)",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                collation: "ascii_general_ci");

            migrationBuilder.AddColumn<bool>(
                name: "IsReadOnly",
                table: "Mechanisms",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<Guid>(
                name: "CurrentVersionId",
                table: "Families",
                type: "char(36)",
                nullable: true,
                collation: "ascii_general_ci");

            migrationBuilder.CreateTable(
                name: "FamilyVersions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    CreatedDate = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    FamilyId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FamilyVersions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FamilyVersions_Families_FamilyId",
                        column: x => x.FamilyId,
                        principalTable: "Families",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_Mechanisms_FamilyVersionId",
                table: "Mechanisms",
                column: "FamilyVersionId");

            migrationBuilder.CreateIndex(
                name: "IX_Families_CurrentVersionId",
                table: "Families",
                column: "CurrentVersionId");

            migrationBuilder.CreateIndex(
                name: "IX_FamilyVersions_FamilyId",
                table: "FamilyVersions",
                column: "FamilyId");

            migrationBuilder.AddForeignKey(
                name: "FK_Families_FamilyVersions_CurrentVersionId",
                table: "Families",
                column: "CurrentVersionId",
                principalTable: "FamilyVersions",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Mechanisms_FamilyVersions_FamilyVersionId",
                table: "Mechanisms",
                column: "FamilyVersionId",
                principalTable: "FamilyVersions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Phases_FamilyVersions_FamilyVersionId",
                table: "Phases",
                column: "FamilyVersionId",
                principalTable: "FamilyVersions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Reactions_FamilyVersions_FamilyVersionId",
                table: "Reactions",
                column: "FamilyVersionId",
                principalTable: "FamilyVersions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Species_FamilyVersions_FamilyVersionId",
                table: "Species",
                column: "FamilyVersionId",
                principalTable: "FamilyVersions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Families_FamilyVersions_CurrentVersionId",
                table: "Families");

            migrationBuilder.DropForeignKey(
                name: "FK_Mechanisms_FamilyVersions_FamilyVersionId",
                table: "Mechanisms");

            migrationBuilder.DropForeignKey(
                name: "FK_Phases_FamilyVersions_FamilyVersionId",
                table: "Phases");

            migrationBuilder.DropForeignKey(
                name: "FK_Reactions_FamilyVersions_FamilyVersionId",
                table: "Reactions");

            migrationBuilder.DropForeignKey(
                name: "FK_Species_FamilyVersions_FamilyVersionId",
                table: "Species");

            migrationBuilder.DropTable(
                name: "FamilyVersions");

            migrationBuilder.DropIndex(
                name: "IX_Mechanisms_FamilyVersionId",
                table: "Mechanisms");

            migrationBuilder.DropIndex(
                name: "IX_Families_CurrentVersionId",
                table: "Families");

            migrationBuilder.DropColumn(
                name: "FamilyVersionId",
                table: "Mechanisms");

            migrationBuilder.DropColumn(
                name: "IsReadOnly",
                table: "Mechanisms");

            migrationBuilder.DropColumn(
                name: "CurrentVersionId",
                table: "Families");

            migrationBuilder.RenameColumn(
                name: "FamilyVersionId",
                table: "Species",
                newName: "FamilyId");

            migrationBuilder.RenameIndex(
                name: "IX_Species_FamilyVersionId",
                table: "Species",
                newName: "IX_Species_FamilyId");

            migrationBuilder.RenameColumn(
                name: "FamilyVersionId",
                table: "Reactions",
                newName: "FamilyId");

            migrationBuilder.RenameIndex(
                name: "IX_Reactions_FamilyVersionId",
                table: "Reactions",
                newName: "IX_Reactions_FamilyId");

            migrationBuilder.RenameColumn(
                name: "FamilyVersionId",
                table: "Phases",
                newName: "FamilyId");

            migrationBuilder.RenameIndex(
                name: "IX_Phases_FamilyVersionId",
                table: "Phases",
                newName: "IX_Phases_FamilyId");

            migrationBuilder.AddForeignKey(
                name: "FK_Phases_Families_FamilyId",
                table: "Phases",
                column: "FamilyId",
                principalTable: "Families",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Reactions_Families_FamilyId",
                table: "Reactions",
                column: "FamilyId",
                principalTable: "Families",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Species_Families_FamilyId",
                table: "Species",
                column: "FamilyId",
                principalTable: "Families",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
