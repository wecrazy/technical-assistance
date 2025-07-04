package controllers

import (
	"fmt"
	"net/http"
	"strings"
	"ta_csna/model/op_model"

	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
	"gorm.io/gorm"
)

// ShowPhotoByID handles GET /photos/:id requests
func ShowPhotoByID(redisDB *redis.Client, db_pengerjaan *gorm.DB) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		id_task := ctx.Param("id")
		if id_task == "" {
			ctx.JSON(http.StatusBadRequest, gin.H{"message": "photo not found"})
			return
		}

		table := ctx.Query("table")
		if table == "" {
			ctx.JSON(http.StatusBadRequest, gin.H{"message": "unknown table to search the data"})
			return
		}

		var joData interface{}
		if table == "error" {
			var errorData op_model.Error
			result := db_pengerjaan.Model(&op_model.Error{}).Where("id_task = ?", id_task).First(&errorData)
			if result.Error != nil {
				ctx.JSON(http.StatusInternalServerError, gin.H{"message": "failed to fetch data", "detail": result.Error.Error()})
				return
			}
			joData = errorData
		} else {
			var pendingData op_model.Pending
			result := db_pengerjaan.Model(&op_model.Pending{}).Where("id_task = ?", id_task).First(&pendingData)
			if result.Error != nil {
				ctx.JSON(http.StatusInternalServerError, gin.H{"message": "failed to fetch data", "detail": result.Error.Error()})
				return
			}
			joData = pendingData
		}

		var teknisi, woNumber, ticketSubject, merchant, mid, tid string
		switch v := joData.(type) {
		case op_model.Error:
			teknisi = v.Teknisi
			woNumber = v.WoNumber
			ticketSubject = v.SpkNumber
			merchant = *v.Merchant
			mid = v.MID
			tid = v.TID
		case op_model.Pending:
			teknisi = v.Teknisi
			woNumber = v.WoNumber
			ticketSubject = v.SpkNumber
			merchant = *v.Merchant
			mid = v.MID
			tid = v.TID
		}

		id_foto := []string{
			"x_foto_bast", "x_foto_ceklis", "x_foto_edc", "x_foto_pic", "x_foto_setting",
			"x_foto_thermal", "x_foto_toko", "x_foto_training", "x_foto_transaksi",
			"x_tanda_tangan_pic", "x_tanda_tangan_teknisi",
			"x_foto_sticker_edc", "x_foto_screen_guard", "x_foto_all_transaction",
			"x_foto_transaksi_bmri", "x_foto_transaksi_bni", "x_foto_transaksi_bri",
			"x_foto_transaksi_btn", "x_foto_transaksi_patch", "x_foto_screen_p2g",
			"x_foto_kontak_stiker_pic",
		}

		judul_foto := []string{
			"Foto BAST", "Foto Media Promo", "Foto SN EDC", "Foto PIC Merchant", "Foto Pengaturan",
			"Foto Thermal", "Foto Merchant", "Foto Surat Training", "Foto Transaksi",
			"Tanda Tangan PIC", "Tanda Tangan Teknisi",
			"Foto Stiker EDC", "Foto Screen Gard", "Foto Sales Draft All Memberbank",
			"Foto Sales Draft BMRI", "Foto Sales Draft BNI", "Foto Sales Draft BRI",
			"Foto Sales Draft BTN", "Foto Sales Draft Patch L", "Foto Screen P2G",
			"Foto Kontak Stiker PIC",
		}

		var html strings.Builder
		html.WriteString(`
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Photo Gallery</title>
	<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
	<link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css" rel="stylesheet">
	<style>
		body {
			background-color: #f8f9fa;
		}
		.photo-card {
			transition: transform 0.2s ease-in-out;
		}
		.photo-card:hover {
			transform: scale(1.05);
			box-shadow: 0 4px 20px rgba(0,0,0,0.2);
		}
		.data-label {
			font-weight: 600;
			color: #343a40;
		}
	</style>
</head>
<body>
	<script>
		function openImagePopup(url) {
			const width = 400;
			const height = 700;
			const left = 0;
			const top = 20;

			window.open(
				url,
				'imagePopup',
				'width=' + width + ',height=' + height + ',left=' + left + ',top=' + top + ',resizable=yes,scrollbars=yes'
			);
		}
	</script>

	<div class="container mt-4">
		<h2 class="text-center mb-4">Photo Gallery for ID Task: ` + id_task + `</h2>

		<div class="card mb-4 shadow-sm border-0">
	<div class="card-body">
		<div class="row g-3">
			<div class="col-md-6 d-flex">
				<div class="me-3">
					<i class="bi bi-person-lines-fill fs-3 text-secondary"></i>
				</div>
				<div>
				<div><span class="fw-semibold text-muted">Ticket Subject:</span> ` + ticketSubject + `</div>
				<div><span class="fw-semibold text-muted">WO Number:</span> ` + woNumber + `</div>
				<div><span class="fw-semibold text-muted">Teknisi:</span> ` + teknisi + `</div>
				</div>
			</div>
			<div class="col-md-6 d-flex">
				<div class="me-3">
					<i class="bi bi-shop-window fs-3 text-secondary"></i>
				</div>
				<div>
					<div><span class="fw-semibold text-muted">Merchant:</span> ` + merchant + `</div>
					<div><span class="fw-semibold text-muted">MID:</span> ` + mid + `</div>
					<div><span class="fw-semibold text-muted">TID:</span> ` + tid + `</div>
				</div>
			</div>
		</div>
	</div>
</div>

		<div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4">
`)

		for i, id := range id_foto {
			html.WriteString(fmt.Sprintf(`
			<div class="col">
				<div class="card photo-card h-100 text-center">
					<img src="/here/file/%s@%s" 
						class="card-img-top" 
						alt="%s"
						style="height:250px; object-fit:contain; cursor:pointer;"
						onclick="openImagePopup(this.src);"
						onerror="this.onerror=null; this.src='/assets/self/img/no-img.jpg';">
					<div class="card-body">
						<h5 class="card-title">%s</h5>
					</div>
				</div>
			</div>
	`, id_task, id, judul_foto[i], judul_foto[i]))
		}

		html.WriteString(`
		</div>
		<div class="text-center mt-4">
			<a href="/" class="btn btn-secondary">
				<i class="bi bi-arrow-left-circle me-1"></i> Back to Home
			</a>
		</div>
	</div>
	<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></>
</body>
</html>
`)

		ctx.Header("Content-Type", "text/html")
		ctx.String(http.StatusOK, html.String())

	}
}
