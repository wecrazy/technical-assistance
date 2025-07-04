package controllers

import (
	"crypto/tls"
	"errors"
	"fmt"
	"log"
	"os"
	"ta_csna/config"
	"time"

	"github.com/gin-gonic/gin"
	"gopkg.in/gomail.v2"
	"gorm.io/gorm"
)

type EmailAttachment struct {
	FilePath    string
	NewFileName string
}

type TechnicianInfo struct {
	SPL  string
	Head string
}

var TechnicianODOOData = map[string]TechnicianInfo{
	// TOMI BUSTAMI
	"1.10 SPL Tangsel Ibnu Saputra": {
		SPL:  "1.10 SPL Tangsel Ibnu Saputra",
		Head: "Tomi Bustami",
	},
	"1.10 Tangsel Dedikairullah": {
		SPL:  "1.10 SPL Tangsel Ibnu Saputra",
		Head: "Tomi Bustami",
	},
	"1.10 Tangsel Deni Maulana": {
		SPL:  "1.10 SPL Tangsel Ibnu Saputra",
		Head: "Tomi Bustami",
	},
	"1.10 Tangsel Herman Indra": {
		SPL:  "1.10 SPL Tangsel Ibnu Saputra",
		Head: "Tomi Bustami",
	},
	"1.11 Inhouse Cideng Arief Budi": {
		SPL:  "1.11 SPL Jakbar & Jakpus Achamad Heri",
		Head: "Tomi Bustami",
	},
	"1.11 Inhouse Jakbar Sanjani": {
		SPL:  "1.11 SPL Jakbar & Jakpus Achamad Heri",
		Head: "Tomi Bustami",
	},
	"1.11 Jakbar Adib Rahmat": {
		SPL:  "1.11 SPL Jakbar & Jakpus Achamad Heri",
		Head: "Tomi Bustami",
	},
	"1.11 Jakbar Agustian": {
		SPL:  "1.11 SPL Jakbar & Jakpus Achamad Heri",
		Head: "Tomi Bustami",
	},
	"1.11 Jakbar Akmal": {
		SPL:  "1.11 SPL Jakbar & Jakpus Achamad Heri",
		Head: "Tomi Bustami",
	},
	"1.11 Jakbar Farhan Supanta": {
		SPL:  "1.11 SPL Jakbar & Jakpus Achamad Heri",
		Head: "Tomi Bustami",
	},
	"1.11 Jakbar Ferdian": {
		SPL:  "1.11 SPL Jakbar & Jakpus Achamad Heri",
		Head: "Tomi Bustami",
	},
	"1.11 Jakbar Galih Agung": {
		SPL:  "1.11 SPL Jakbar & Jakpus Achamad Heri",
		Head: "Tomi Bustami",
	},
	"1.11 Jakbar Leo Sugiharto": {
		SPL:  "1.11 SPL Jakbar & Jakpus Achamad Heri",
		Head: "Tomi Bustami",
	},
	"1.11 Jakbar Yonathan": {
		SPL:  "1.11 SPL Jakbar & Jakpus Achamad Heri",
		Head: "Tomi Bustami",
	},
	"1.11 Jakpus Abdul Rohim": {
		SPL:  "1.11 SPL Jakbar & Jakpus Achamad Heri",
		Head: "Tomi Bustami",
	},
	"1.11 Jakpus Dedy Murwanto": {
		SPL:  "1.11 SPL Jakbar & Jakpus Achamad Heri",
		Head: "Tomi Bustami",
	},
	"1.11 Jakpus Muhamad Soleh": {
		SPL:  "1.11 SPL Jakbar & Jakpus Achamad Heri",
		Head: "Tomi Bustami",
	},
	"1.11 Jakpus Yohanes Pardede": {
		SPL:  "1.11 SPL Jakbar & Jakpus Achamad Heri",
		Head: "Tomi Bustami",
	},
	"1.2 Inhouse Jaktim Cholil": {
		SPL:  "1.2 SPL Jaktim & Jakut Andry",
		Head: "Tomi Bustami",
	},
	"1.2 Jaktim Eko Budiarto": {
		SPL:  "1.2 SPL Jaktim & Jakut Andry",
		Head: "Tomi Bustami",
	},
	"1.2 Jaktim Frizkhi": {
		SPL:  "1.2 SPL Jaktim & Jakut Andry",
		Head: "Tomi Bustami",
	},
	"1.2 Jaktim Iqbal Agus": {
		SPL:  "1.2 SPL Jaktim & Jakut Andry",
		Head: "Tomi Bustami",
	},
	"1.2 Jaktim Maekdo Polak": {
		SPL:  "1.2 SPL Jaktim & Jakut Andry",
		Head: "Tomi Bustami",
	},
	"1.2 Jaktim Reggy Adhiswara": {
		SPL:  "1.2 SPL Jaktim & Jakut Andry",
		Head: "Tomi Bustami",
	},
	"1.2 Jakut Agus": {
		SPL:  "1.2 SPL Jaktim & Jakut Andry",
		Head: "Tomi Bustami",
	},
	"1.2 Jakut Dedi Kurniawan": {
		SPL:  "1.2 SPL Jaktim & Jakut Andry",
		Head: "Tomi Bustami",
	},
	"1.2 Jakut Edohnis Paesal": {
		SPL:  "1.2 SPL Jaktim & Jakut Andry",
		Head: "Tomi Bustami",
	},
	"1.2 Jakut Faisal Riza": {
		SPL:  "1.2 SPL Jaktim & Jakut Andry",
		Head: "Tomi Bustami",
	},
	"1.2 Jakut Tiyo Aminudin": {
		SPL:  "1.2 SPL Jaktim & Jakut Andry",
		Head: "Tomi Bustami",
	},
	"1.2 SPL Jaktim & Jakut Andry": {
		SPL:  "1.2 SPL Jaktim & Jakut Andry",
		Head: "Tomi Bustami",
	},
	"1.3 Bekasi Ade Susanto": {
		SPL:  "1.3 SPL Bekasi Rizal",
		Head: "Tomi Bustami",
	},
	"1.3 Bekasi Eko Putra": {
		SPL:  "1.3 SPL Bekasi Rizal",
		Head: "Tomi Bustami",
	},
	"1.3 Bekasi Lukman Hakim": {
		SPL:  "1.3 SPL Bekasi Rizal",
		Head: "Tomi Bustami",
	},
	"1.3 Bekasi Rifki Syahrial": {
		SPL:  "1.3 SPL Bekasi Rizal",
		Head: "Tomi Bustami",
	},
	"1.3 Bekasi Rifki syahrial": {
		SPL:  "1.3 SPL Bekasi Rizal",
		Head: "Tomi Bustami",
	},
	"1.3 Bekasi Rusmana": {
		SPL:  "1.3 SPL Bekasi Rizal",
		Head: "Tomi Bustami",
	},
	"1.3 Cikarang Irpan Maulana": {
		SPL:  "1.3 SPL Bekasi Rizal",
		Head: "Tomi Bustami",
	},
	"1.3 Inhouse Bekasi Aldy": {
		SPL:  "1.3 SPL Bekasi Rizal",
		Head: "Tomi Bustami",
	},
	"1.3 SPL Bekasi Rizal Feviadi": {
		SPL:  "1.3 SPL Bekasi Rizal",
		Head: "Tomi Bustami",
	},
	"1.4 Bogor Ade Amaja": {
		SPL:  "1.4 SPL Bogor Maman",
		Head: "Tomi Bustami",
	},
	"1.4 Bogor Didi Jamil": {
		SPL:  "1.4 SPL Bogor Maman",
		Head: "Tomi Bustami",
	},
	"1.4 Bogor Heriyanto": {
		SPL:  "1.4 SPL Bogor Maman",
		Head: "Tomi Bustami",
	},
	"1.4 Bogor Juni Tri Handoko": {
		SPL:  "1.4 SPL Bogor Maman",
		Head: "Tomi Bustami",
	},
	"1.4 Bogor Legi": {
		SPL:  "1.4 SPL Bogor Maman",
		Head: "Tomi Bustami",
	},
	"1.4 Bogor Novrizal": {
		SPL:  "1.4 SPL Bogor Maman",
		Head: "Tomi Bustami",
	},
	"1.4 Inhouse Bogor Revo": {
		SPL:  "1.4 SPL Bogor Maman",
		Head: "Tomi Bustami",
	},
	"1.4 SPL Bogor Maman": {
		SPL:  "1.4 SPL Bogor Maman",
		Head: "Tomi Bustami",
	},
	"1.5 Depok Agape Trihan": {
		SPL:  "1.5 SPL Depok Ridha",
		Head: "Tomi Bustami",
	},
	"1.5 Depok Anwar Ardiansyah": {
		SPL:  "1.5 SPL Depok Ridha",
		Head: "Tomi Bustami",
	},
	"1.5 Depok M Ghufron": {
		SPL:  "1.5 SPL Depok Ridha",
		Head: "Tomi Bustami",
	},
	"1.5 Depok Ricka": {
		SPL:  "1.5 SPL Depok Ridha",
		Head: "Tomi Bustami",
	},
	"1.5 Inhouse Depok Rifki": {
		SPL:  "1.5 SPL Depok Ridha",
		Head: "Tomi Bustami",
	},
	"1.5 SPL Depok Ridha": {
		SPL:  "1.5 SPL Depok Ridha",
		Head: "Tomi Bustami",
	},
	"1.6 Inhouse Jaksel Ady Permana": {
		SPL:  "1.6 SPL Jaksel Ahmad Soni",
		Head: "Tomi Bustami",
	},
	"1.6 Jaksel Abdul Rahim": {
		SPL:  "1.6 SPL Jaksel Ahmad Soni",
		Head: "Tomi Bustami",
	},
	"1.6 Jaksel Andi Supeno": {
		SPL:  "1.6 SPL Jaksel Ahmad Soni",
		Head: "Tomi Bustami",
	},
	"1.11 SPL Jakpus Andi Setiawan": {
		SPL:  "1.11 SPL Jakpus Andi Setiawan",
		Head: "Tomi Bustami",
	},
	"1.6 Jaksel Angga Saputra": {
		SPL:  "1.6 SPL Jaksel Ahmad Soni",
		Head: "Tomi Bustami",
	},
	"1.6 Jaksel Arief Setiawan": {
		SPL:  "1.6 SPL Jaksel Ahmad Soni",
		Head: "Tomi Bustami",
	},
	"1.6 Jaksel David Chan": {
		SPL:  "1.6 SPL Jaksel Ahmad Soni",
		Head: "Tomi Bustami",
	},
	"1.6 Jaksel Djauhari": {
		SPL:  "1.6 SPL Jaksel Ahmad Soni",
		Head: "Tomi Bustami",
	},
	"1.6 Jaksel Rizky Maulana": {
		SPL:  "1.6 SPL Jaksel Ahmad Soni",
		Head: "Tomi Bustami",
	},
	"1.6 Jaksel Saipul Akbar": {
		SPL:  "1.6 SPL Jaksel Ahmad Soni",
		Head: "Tomi Bustami",
	},
	"1.6 Jaksel Yudi Mutahir": {
		SPL:  "1.6 SPL Jaksel Ahmad Soni",
		Head: "Tomi Bustami",
	},
	"1.6 SPL Jaksel Ahmad Soni": {
		SPL:  "1.6 SPL Jaksel Ahmad Soni",
		Head: "Tomi Bustami",
	},
	"1.7 Cikampek Ahamad Madjazi": {
		SPL:  "1.7 SPL Karawang Upu",
		Head: "Tomi Bustami",
	},
	"1.7 Karawang Dede supriatna": {
		SPL:  "1.7 SPL Karawang Upu",
		Head: "Tomi Bustami",
	},
	"1.7 Karawang Hanafi": {
		SPL:  "1.7 SPL Karawang Upu",
		Head: "Tomi Bustami",
	},
	"1.7 SPL Karawang Upu": {
		SPL:  "1.7 SPL Karawang Upu",
		Head: "Tomi Bustami",
	},
	"1.8 Inhouse Serang Rio Saputra": {
		SPL:  "1.8 SPL Serang Syahrul Rohim",
		Head: "Tomi Bustami",
	},
	"1.8 Serang Ardiansyah": {
		SPL:  "1.8 SPL Serang Syahrul Rohim",
		Head: "Tomi Bustami",
	},
	"1.8 Serang Ikballahudin": {
		SPL:  "1.8 SPL Serang Syahrul Rohim",
		Head: "Tomi Bustami",
	},
	"1.8 SPL Serang syahrul rohim": {
		SPL:  "1.8 SPL Serang Syahrul Rohim",
		Head: "Tomi Bustami",
	},
	"1.9 Balaraja Komarudin": {
		SPL:  "1.9 SPL Tangerang Iqbal haris",
		Head: "Tomi Bustami",
	},
	"1.9 Inhouse Tangerang Wimpi Julianto": {
		SPL:  "1.9 SPL Tangerang Iqbal haris",
		Head: "Tomi Bustami",
	},
	"1.9 Inhouse Tangeran Wimpi Julianto": {
		SPL:  "1.9 SPL Tangerang Iqbal haris",
		Head: "Tomi Bustami",
	},
	"1.9 Inhouse Tangerang Alif Lutfi": {
		SPL:  "1.9 SPL Tangerang Iqbal haris",
		Head: "Tomi Bustami",
	},
	"1.9 SPL Tangerang Iqbal Haris": {
		SPL:  "1.9 SPL Tangerang Iqbal haris",
		Head: "Tomi Bustami",
	},
	"1.9 Tangerang Achmad Rizki": {
		SPL:  "1.9 SPL Tangerang Iqbal haris",
		Head: "Tomi Bustami",
	},
	"1.9 Tangerang Agung": {
		SPL:  "1.9 SPL Tangerang Iqbal haris",
		Head: "Tomi Bustami",
	},
	"1.9 Tangerang Bachrul": {
		SPL:  "1.9 SPL Tangerang Iqbal haris",
		Head: "Tomi Bustami",
	},
	"1.9 Tangerang Kiswanto": {
		SPL:  "1.9 SPL Tangerang Iqbal haris",
		Head: "Tomi Bustami",
	},
	"1.9 Tangerang Nanang Nurhadiyanto": {
		SPL:  "1.9 SPL Tangerang Iqbal haris",
		Head: "Tomi Bustami",
	},
	"1.9 Tangerang Suwandi": {
		SPL:  "1.9 SPL Tangerang Iqbal haris",
		Head: "Tomi Bustami",
	},
	"1.9 Tangerang Syarif Hidayat": {
		SPL:  "1.9 SPL Tangerang Iqbal haris",
		Head: "Tomi Bustami",
	},
	"1.9 Tangerang Tirta Prasetia": {
		SPL:  "1.9 SPL Tangerang Iqbal haris",
		Head: "Tomi Bustami",
	},
	// HERIANDI
	"2.11 Batang Fatkhur Rozi": {
		SPL:  "2.11 SPL Tegal Tirta",
		Head: "Heriandi",
	},
	"2.11 Brebes Abu Aziz": {
		SPL:  "2.11 SPL Tegal Tirta",
		Head: "Heriandi",
	},
	"2.11 Brebes Darsono": {
		SPL:  "2.11 SPL Tegal Tirta",
		Head: "Heriandi",
	},
	"2.11 Brebes Deni Seftian": {
		SPL:  "2.11 SPL Tegal Tirta",
		Head: "Heriandi",
	},
	"2.11 Pemalang Priyadin": {
		SPL:  "2.11 SPL Tegal Tirta",
		Head: "Heriandi",
	},
	"2.11 SPL Tegal Tirta": {
		SPL:  "2.11 SPL Tegal Tirta",
		Head: "Heriandi",
	},
	"2.11 Tegal Mukhibudin": {
		SPL:  "2.11 SPL Tegal Tirta",
		Head: "Heriandi",
	},
	"2.11 Tegal Reza Prayudi": {
		SPL:  "2.11 SPL Tegal Tirta",
		Head: "Heriandi",
	},
	"2.2 Bengkulu Yosevin Antonius": {
		SPL:  "2.2 SPL Palembang Zefrian",
		Head: "Heriandi",
	},
	"2.2 Jambi Doni Damara": {
		SPL:  "2.2 SPL Palembang Zefrian",
		Head: "Heriandi",
	},
	"2.2 Jambi Wahyu Rahmansyah": {
		SPL:  "2.2 SPL Palembang Zefrian",
		Head: "Heriandi",
	},
	"2.2 Lampung Aji Tri Winardi": {
		SPL:  "2.2 SPL Palembang Zefrian",
		Head: "Heriandi",
	},
	"2.2 Lampung Cholid Fadilah H": {
		SPL:  "2.2 SPL Palembang Zefrian",
		Head: "Heriandi",
	},
	"2.2 Palembang Fajri": {
		SPL:  "2.2 SPL Palembang Zefrian",
		Head: "Heriandi",
	},
	"2.2 Palembang Idrus Munandar": {
		SPL:  "2.2 SPL Palembang Zefrian",
		Head: "Heriandi",
	},
	"2.2 Palembang M Arif": {
		SPL:  "2.2 SPL Palembang Zefrian",
		Head: "Heriandi",
	},
	"2.2 Pangkal Pinang Mardian": {
		SPL:  "2.2 SPL Palembang Zefrian",
		Head: "Heriandi",
	},
	"2.2 SPL Palembang Zefrian": {
		SPL:  "2.2 SPL Palembang Zefrian",
		Head: "Heriandi",
	},
	"2.3 SPL Pontianak Muflih": {
		SPL:  "2.3 SPL Pontianak Muflih",
		Head: "Heriandi",
	},
	"2.3 Pontianak Wisnu Cahyadi": {
		SPL:  "2.3 SPL Pontianak Muflih",
		Head: "Heriandi",
	},
	"2.4 Banyuwangi Kurniawan": {
		SPL:  "2.4 SPL Malang Dhika",
		Head: "Heriandi",
	},
	"2.4 Blitar Fuad Hasan": {
		SPL:  "2.4 SPL Malang Dhika",
		Head: "Heriandi",
	},
	"2.4 Jember Hafiz": {
		SPL:  "2.4 SPL Malang Dhika",
		Head: "Heriandi",
	},
	"2.4 Kediri Kevin Dwi": {
		SPL:  "2.4 SPL Malang Dhika",
		Head: "Heriandi",
	},
	"2.4 Lumajang Yudi Julianto": {
		SPL:  "2.4 SPL Malang Dhika",
		Head: "Heriandi",
	},
	"2.4 Madiun Dhani Amar Maruf": {
		SPL:  "2.4 SPL Malang Dhika",
		Head: "Heriandi",
	},
	"2.4 Madiun Rahmanto": {
		SPL:  "2.4 SPL Malang Dhika",
		Head: "Heriandi",
	},
	"2.4 Malang Andhika Prayoga": {
		SPL:  "2.4 SPL Malang Dhika",
		Head: "Heriandi",
	},
	"2.4 Malang Budi Dwi": {
		SPL:  "2.4 SPL Malang Dhika",
		Head: "Heriandi",
	},
	"2.4 Malang Feri Fendik": {
		SPL:  "2.4 SPL Malang Dhika",
		Head: "Heriandi",
	},
	"2.4 Pasuruan Renaldo Renney": {
		SPL:  "2.4 SPL Malang Dhika",
		Head: "Heriandi",
	},
	"2.4 Probolinggo Achmad Taufik": {
		SPL:  "2.4 SPL Malang Dhika",
		Head: "Heriandi",
	},
	"2.4 SPL Malang Dhika": {
		SPL:  "2.4 SPL Malang Dhika",
		Head: "Heriandi",
	},
	"2.4 Tulungagung Arik Faridhalatul": {
		SPL:  "2.4 SPL Malang Dhika",
		Head: "Heriandi",
	},
	"2.5 Ambon Abdul Malik": {
		SPL:  "2.5 SPL Manado Bryan",
		Head: "Heriandi",
	},
	"2.5 Manado Devi Christovel": {
		SPL:  "2.5 SPL Manado Bryan",
		Head: "Heriandi",
	},
	"2.5 Manado Jerico": {
		SPL:  "2.5 SPL Manado Bryan",
		Head: "Heriandi",
	},
	"2.5 SPL Manado Bryan": {
		SPL:  "2.5 SPL Manado Bryan",
		Head: "Heriandi",
	},
	"2.6 Kupang Robert": {
		SPL:  "2.6 SPL Mataram Hizbul",
		Head: "Heriandi",
	},
	"2.6 Mataram Deny Saputra": {
		SPL:  "2.6 SPL Mataram Hizbul",
		Head: "Heriandi",
	},
	"2.6 Mataram Faris Afandi": {
		SPL:  "2.6 SPL Mataram Hizbul",
		Head: "Heriandi",
	},
	"2.6 Mataram Pramasgus": {
		SPL:  "2.6 SPL Mataram Hizbul",
		Head: "Heriandi",
	},
	"2.6 Mataram Wijahadi Kurnia": {
		SPL:  "2.6 SPL Mataram Hizbul",
		Head: "Heriandi",
	},
	"2.6 Papua Priyo Adi": {
		SPL:  "2.6 SPL Mataram Hizbul",
		Head: "Heriandi",
	},
	"2.6 Sorong Wahid Nurrohman": {
		SPL:  "2.6 SPL Mataram Hizbul",
		Head: "Heriandi",
	},
	"2.6 SPL Mataram Hizbul": {
		SPL:  "2.6 SPL Mataram Hizbul",
		Head: "Heriandi",
	},
	"2.8 Balikpapan Gampang": {
		SPL:  "2.8 SPL Balikpapan Rahmaddianto",
		Head: "Heriandi",
	},
	"2.8 Balikpapan Rizal Fauzi Ahmad": {
		SPL:  "2.8 SPL Balikpapan Rahmaddianto",
		Head: "Heriandi",
	},
	"2.8 Banjarbaru Ahmad Fikri": {
		SPL:  "2.8 SPL Balikpapan Rahmaddianto",
		Head: "Heriandi",
	},
	"2.8 Banjarmasin M Artoni": {
		SPL:  "2.8 SPL Balikpapan Rahmaddianto",
		Head: "Heriandi",
	},
	"2.8 Banjarmasin Rizana Rukmana": {
		SPL:  "2.8 SPL Balikpapan Rahmaddianto",
		Head: "Heriandi",
	},
	"2.8 Inhouse Samarinda Ariyanto": {
		SPL:  "2.8 SPL Balikpapan Rahmaddianto",
		Head: "Heriandi",
	},
	"2.8 Palangkaraya Sri Wahyudi": {
		SPL:  "2.8 SPL Balikpapan Rahmaddianto",
		Head: "Heriandi",
	},
	"2.8 Samarinda Adi Putra": {
		SPL:  "2.8 SPL Balikpapan Rahmaddianto",
		Head: "Heriandi",
	},
	"2.8 SPL Balikpapan Rahmaddianto": {
		SPL:  "2.8 SPL Balikpapan Rahmaddianto",
		Head: "Heriandi",
	},
	// OSVALDO
	"3.1 Batam Bahtiar": {
		SPL:  "3.1 SPL Batam Polinus",
		Head: "Osvaldo",
	},
	"3.1 Batam Deni Satria": {
		SPL:  "3.1 SPL Batam Polinus",
		Head: "Osvaldo",
	},
	"3.1 Batam Hadriyanus": {
		SPL:  "3.1 SPL Batam Polinus",
		Head: "Osvaldo",
	},
	"3.1 SPL Batam Polinus": {
		SPL:  "3.1 SPL Batam Polinus",
		Head: "Osvaldo",
	},
	"3.2 Inhouse Medan Dimas": {
		SPL:  "3.2 SPL Medan Iksan",
		Head: "Osvaldo",
	},
	"3.2 Medan Ali Idris": {
		SPL:  "3.2 SPL Medan Iksan",
		Head: "Osvaldo",
	},
	"3.2 Medan Arief Gunawan": {
		SPL:  "3.2 SPL Medan Iksan",
		Head: "Osvaldo",
	},
	"3.2 Medan Arion DS": {
		SPL:  "3.2 SPL Medan Iksan",
		Head: "Osvaldo",
	},
	"3.2 Medan Fauzi": {
		SPL:  "3.2 SPL Medan Iksan",
		Head: "Osvaldo",
	},
	"3.2 Medan Joni": {
		SPL:  "3.2 SPL Medan Iksan",
		Head: "Osvaldo",
	},
	"3.2 Medan Mahlizar": {
		SPL:  "3.2 SPL Medan Iksan",
		Head: "Osvaldo",
	},
	"3.2 Medan Zulfikar": {
		SPL:  "3.2 SPL Medan Iksan",
		Head: "Osvaldo",
	},
	"3.2 SPL Medan Iksan": {
		SPL:  "3.2 SPL Medan Iksan",
		Head: "Osvaldo",
	},
	"3.2 Tebing Tinggi Andre": {
		SPL:  "3.2 SPL Medan Iksan",
		Head: "Osvaldo",
	},
	"3.3 Denpasar Cipta Muliawan": {
		SPL:  "3.3 SPL Denpasar Putu Oka",
		Head: "Osvaldo",
	},
	"3.3 Denpasar I Nyoman Agustina": {
		SPL:  "3.3 SPL Denpasar Putu Oka",
		Head: "Osvaldo",
	},
	"3.3 Denpasar Imade": {
		SPL:  "3.3 SPL Denpasar Putu Oka",
		Head: "Osvaldo",
	},
	"3.3 Denpasar Kresna Mahaditya": {
		SPL:  "3.3 SPL Denpasar Putu Oka",
		Head: "Osvaldo",
	},
	"3.3 Denpasar Nusa Firdaus": {
		SPL:  "3.3 SPL Denpasar Putu Oka",
		Head: "Osvaldo",
	},
	"3.3 Denpasar Nyoman Sumantri": {
		SPL:  "3.3 SPL Denpasar Putu Oka",
		Head: "Osvaldo",
	},
	"3.3 Denpasar Sandra": {
		SPL:  "3.3 SPL Denpasar Putu Oka",
		Head: "Osvaldo",
	},
	"3.3 Inhouse Bali Putu Eka": {
		SPL:  "3.3 SPL Denpasar Putu Oka",
		Head: "Osvaldo",
	},
	"3.3 SPL Denpasar Putu Oka": {
		SPL:  "3.3 SPL Denpasar Putu Oka",
		Head: "Osvaldo",
	},
	"3.4 Gianyar Dewa": {
		SPL:  "3.4 SPL Bali Agung Arianto",
		Head: "Osvaldo",
	},
	"3.4 Gianyar Made Ary": {
		SPL:  "3.4 SPL Bali Agung Arianto",
		Head: "Osvaldo",
	},
	"3.4 Gianyar Penida Gede Diana": {
		SPL:  "3.4 SPL Bali Agung Arianto",
		Head: "Osvaldo",
	},
	"3.4 Gianyar Wayan Omi": {
		SPL:  "3.4 SPL Bali Agung Arianto",
		Head: "Osvaldo",
	},
	"3.4 SPL Bali Agung Arianto": {
		SPL:  "3.4 SPL Bali Agung Arianto",
		Head: "Osvaldo",
	},
	"3.4 Ubud Ruslan": {
		SPL:  "3.4 SPL Bali Agung Arianto",
		Head: "Osvaldo",
	},
	"3.4 Ubud  Ruslan": {
		SPL:  "3.4 SPL Bali Agung Arianto",
		Head: "Osvaldo",
	},
	"3.5 Buleleng Khoiril Anam": {
		SPL:  "3.5 SPL Buleleng Idham",
		Head: "Osvaldo",
	},
	"3.5 Karangasem Mangku": {
		SPL:  "3.5 SPL Buleleng Idham",
		Head: "Osvaldo",
	},
	"3.5 SPL Buleleng Idham": {
		SPL:  "3.5 SPL Buleleng Idham",
		Head: "Osvaldo",
	},
	"3.5 Tabanan Soleh": {
		SPL:  "3.5 SPL Buleleng Idham",
		Head: "Osvaldo",
	},
	"2.1 Bukittinggi Afdhal Mailiadi": {
		SPL:  "2.1 SPL Pekanbaru Hafiz",
		Head: "Osvaldo",
	},
	"2.1 Padang Amri": {
		SPL:  "2.1 SPL Pekanbaru Hafiz",
		Head: "Osvaldo",
	},
	"2.1 Padang Lucky Irvianda": {
		SPL:  "2.1 SPL Pekanbaru Hafiz",
		Head: "Osvaldo",
	},
	"2.1 Pekanbaru Alex Marsegit": {
		SPL:  "2.1 SPL Pekanbaru Hafiz",
		Head: "Osvaldo",
	},
	"2.1 Pekanbaru Hery": {
		SPL:  "2.1 SPL Pekanbaru Hafiz",
		Head: "Osvaldo",
	},
	"2.1 SPL Pekanbaru Hafiz Rahman": {
		SPL:  "2.1 SPL Pekanbaru Hafiz",
		Head: "Osvaldo",
	},
	"2.1 Tanjung Pinang Robi": {
		SPL:  "2.1 SPL Pekanbaru Hafiz",
		Head: "Osvaldo",
	},
	"2.9 Kendari Ali Fahmi Hasan": {
		SPL:  "2.9 SPL Makassar Randy",
		Head: "Osvaldo",
	},
	"2.9 Kendari Nesta Vannes": {
		SPL:  "2.9 SPL Makassar Randy",
		Head: "Osvaldo",
	},
	"2.9 Makassar Ahmad Fausan": {
		SPL:  "2.9 SPL Makassar Randy",
		Head: "Osvaldo",
	},
	"2.9 Makassar Andi Munawir": {
		SPL:  "2.9 SPL Makassar Randy",
		Head: "Osvaldo",
	},
	"2.9 Makassar Asrul Mansyur": {
		SPL:  "2.9 SPL Makassar Randy",
		Head: "Osvaldo",
	},
	"2.9 Makassar Bardo": {
		SPL:  "2.9 SPL Makassar Randy",
		Head: "Osvaldo",
	},
	"2.9 Makassar Yos Arman": {
		SPL:  "2.9 SPL Makassar Randy",
		Head: "Osvaldo",
	},
	"2.9 Palu Chairil Nursalam": {
		SPL:  "2.9 SPL Makassar Randy",
		Head: "Osvaldo",
	},
	"2.9 SPL Makassar Randy": {
		SPL:  "2.9 SPL Makassar Randy",
		Head: "Osvaldo",
	},
	"2.10 Bangkalan Edwin": {
		SPL:  "2.10 SPL Surabaya Fedro",
		Head: "Osvaldo",
	},
	"2.10 Bojonegoro Anang Wahyu": {
		SPL:  "2.10 SPL Surabaya Fedro",
		Head: "Osvaldo",
	},
	"2.10 Gresik Fahrur Rozi": {
		SPL:  "2.10 SPL Surabaya Fedro",
		Head: "Osvaldo",
	},
	"2.10 Inhouse Surabaya Canny": {
		SPL:  "2.10 SPL Surabaya Fedro",
		Head: "Osvaldo",
	},
	"2.10 Lamongan Imron Hamzah": {
		SPL:  "2.10 SPL Surabaya Fedro",
		Head: "Osvaldo",
	},
	"2.10 Madura Abd Rasid": {
		SPL:  "2.10 SPL Surabaya Fedro",
		Head: "Osvaldo",
	},
	"2.10 Madura Achmad Fikri": {
		SPL:  "2.10 SPL Surabaya Fedro",
		Head: "Osvaldo",
	},
	"2.10 Sidoarjo Ilham Faisal": {
		SPL:  "2.10 SPL Surabaya Fedro",
		Head: "Osvaldo",
	},
	"2.10 SPL Surabaya Fedro": {
		SPL:  "2.10 SPL Surabaya Fedro",
		Head: "Osvaldo",
	},
	"2.10 Sumenep Wachid": {
		SPL:  "2.10 SPL Surabaya Fedro",
		Head: "Osvaldo",
	},
	"2.10 Surabaya Ady Candra": {
		SPL:  "2.10 SPL Surabaya Fedro",
		Head: "Osvaldo",
	},
	"2.10 Surabaya  Ady Candra": {
		SPL:  "2.10 SPL Surabaya Fedro",
		Head: "Osvaldo",
	},
	"2.10 Surabaya Dimas Aji P": {
		SPL:  "2.10 SPL Surabaya Fedro",
		Head: "Osvaldo",
	},
	"2.10 Surabaya Hudianto": {
		SPL:  "2.10 SPL Surabaya Fedro",
		Head: "Osvaldo",
	},
	"2.10 Surabaya Rhafel Ekhza": {
		SPL:  "2.10 SPL Surabaya Fedro",
		Head: "Osvaldo",
	},
	"2.10 Surabaya Roy": {
		SPL:  "2.10 SPL Surabaya Fedro",
		Head: "Osvaldo",
	},
	"2.10 Surabaya Tofan Rifai": {
		SPL:  "2.10 SPL Surabaya Fedro",
		Head: "Osvaldo",
	},
	"2.10 Tuban Medyokto": {
		SPL:  "2.10 SPL Surabaya Fedro",
		Head: "Osvaldo",
	},
	"2.7 Blora Nur Salim": {
		SPL:  "2.7 SPL Semarang Agus",
		Head: "Osvaldo",
	},
	"2.7 Blora Ridwan Devon": {
		SPL:  "2.7 SPL Semarang Agus",
		Head: "Osvaldo",
	},
	"2.7 Demak Edy Setiawan": {
		SPL:  "2.7 SPL Semarang Agus",
		Head: "Osvaldo",
	},
	"2.7 Grobogan Rakhmad Saleh": {
		SPL:  "2.7 SPL Semarang Agus",
		Head: "Osvaldo",
	},
	"2.7 Inhouse Semarang Sholatin": {
		SPL:  "2.7 SPL Semarang Agus",
		Head: "Osvaldo",
	},
	"2.7 Jepara Saifur Rohman": {
		SPL:  "2.7 SPL Semarang Agus",
		Head: "Osvaldo",
	},
	"2.7 Kudus Mukhammad Ilyas": {
		SPL:  "2.7 SPL Semarang Agus",
		Head: "Osvaldo",
	},
	"2.7 Pati Jumadi": {
		SPL:  "2.7 SPL Semarang Agus",
		Head: "Osvaldo",
	},
	"2.7 Semarang Daldiri": {
		SPL:  "2.7 SPL Semarang Agus",
		Head: "Osvaldo",
	},
	"2.7 Semarang Galuh Aldi": {
		SPL:  "2.7 SPL Semarang Agus",
		Head: "Osvaldo",
	},
	"2.7 Semarang Khoir": {
		SPL:  "2.7 SPL Semarang Agus",
		Head: "Osvaldo",
	},
	"2.7 Semarang Reni": {
		SPL:  "2.7 SPL Semarang Agus",
		Head: "Osvaldo",
	},
	"2.7 SPL Semarang Agus": {
		SPL:  "2.7 SPL Semarang Agus",
		Head: "Osvaldo",
	},
	"2.7 Support Semarang": {
		SPL:  "2.7 SPL Semarang Agus",
		Head: "Osvaldo",
	},
	"2.7 Ungaran Rio Pamungkas": {
		SPL:  "2.7 SPL Semarang Agus",
		Head: "Osvaldo",
	},
	// MUJIANTO
	"3.7 Ciamis Aris Kusnendi": {
		SPL:  "3.7 SPL Tasikmalaya Gilar",
		Head: "Mujianto",
	},
	"3.7 Pangandaran Turio": {
		SPL:  "3.7 SPL Tasikmalaya Gilar",
		Head: "Mujianto",
	},
	"3.7 SPL Tasikmalaya Gilar": {
		SPL:  "3.7 SPL Tasikmalaya Gilar",
		Head: "Mujianto",
	},
	"3.7 Tasikmalaya Epi Halim": {
		SPL:  "3.7 SPL Tasikmalaya Gilar",
		Head: "Mujianto",
	},
	"3.7 Tasikmalaya Helmi Hikmudin": {
		SPL:  "3.7 SPL Tasikmalaya Gilar",
		Head: "Mujianto",
	},
	"4.1 Bandung Andri": {
		SPL:  "4.1 SPL Bandung Wawan",
		Head: "Mujianto",
	},
	"4.1 Bandung Dadan Suhandi": {
		SPL:  "4.1 SPL Bandung Wawan",
		Head: "Mujianto",
	},
	"4.1 Bandung Dwi Yogi": {
		SPL:  "4.1 SPL Bandung Wawan",
		Head: "Mujianto",
	},
	"4.1 Bandung Ihksan": {
		SPL:  "4.1 SPL Bandung Wawan",
		Head: "Mujianto",
	},
	"4.1 Bandung Lendra Leriana": {
		SPL:  "4.1 SPL Bandung Wawan",
		Head: "Mujianto",
	},
	"4.1 Bandung Pratama": {
		SPL:  "4.1 SPL Bandung Wawan",
		Head: "Mujianto",
	},
	"4.1 Bandung Soni Sonjaya": {
		SPL:  "4.1 SPL Bandung Wawan",
		Head: "Mujianto",
	},
	"4.1 SPL Bandung Wawan": {
		SPL:  "4.1 SPL Bandung Wawan",
		Head: "Mujianto",
	},
	"4.2 Cirebon Ilhan Nasrullah": {
		SPL:  "4.2 SPL Cirebon Juan",
		Head: "Mujianto",
	},
	"4.2 Cirebon Lingga Dzulfikar": {
		SPL:  "4.2 SPL Cirebon Juan",
		Head: "Mujianto",
	},
	"4.2 Indramayu Daniel Eka": {
		SPL:  "4.2 SPL Cirebon Juan",
		Head: "Mujianto",
	},
	"4.2 Inhouse Cirebon Nizard": {
		SPL:  "4.2 SPL Cirebon Juan",
		Head: "Mujianto",
	},
	"4.2 Kuningan Ryan Habib": {
		SPL:  "4.2 SPL Cirebon Juan",
		Head: "Mujianto",
	},
	"4.2 Majalengka Surya Arif": {
		SPL:  "4.2 SPL Cirebon Juan",
		Head: "Mujianto",
	},
	"4.2 SPL Cirebon Juan": {
		SPL:  "4.2 SPL Cirebon Juan",
		Head: "Mujianto",
	},
	"4.3 Garut Fahmi Aziz": {
		SPL:  "4.3 SPL Garut Abdul Muiz",
		Head: "Mujianto",
	},
	"4.3 Garut Iman Nurohman": {
		SPL:  "4.3 SPL Garut Abdul Muiz",
		Head: "Mujianto",
	},
	"4.3 Garut Muhammad silmi": {
		SPL:  "4.3 SPL Garut Abdul Muiz",
		Head: "Mujianto",
	},
	"4.3 SPL Garut Abdul Muiz": {
		SPL:  "4.3 SPL Garut Abdul Muiz",
		Head: "Mujianto",
	},
	"4.4 Banyumas Diki Purnomo": {
		SPL:  "4.4 SPL Purwokerto Zaenun",
		Head: "Mujianto",
	},
	"4.4 Cilacap Irwan": {
		SPL:  "4.4 SPL Purwokerto Zaenun",
		Head: "Mujianto",
	},
	"4.4 Cilacap Ridwan Setiawan": {
		SPL:  "4.4 SPL Purwokerto Zaenun",
		Head: "Mujianto",
	},
	"4.4 Purbalingga Hendika": {
		SPL:  "4.4 SPL Purwokerto Zaenun",
		Head: "Mujianto",
	},
	"4.4 SPL Purwokerto Zaenun": {
		SPL:  "4.4 SPL Purwokerto Zaenun",
		Head: "Mujianto",
	},
	"4.4 Wonosobo Marstia Dwi": {
		SPL:  "4.4 SPL Purwokerto Zaenun",
		Head: "Mujianto",
	},
	"4.5 Karanganyar Rizqi Afian": {
		SPL:  "4.5 SPL Solo Fuad",
		Head: "Mujianto",
	},
	"4.5 Klaten Arief Budi Wicaksono": {
		SPL:  "4.5 SPL Solo Fuad",
		Head: "Mujianto",
	},
	"4.5 Solo Didit Eko": {
		SPL:  "4.5 SPL Solo Fuad",
		Head: "Mujianto",
	},
	"4.5 Solo Fahmi Tri": {
		SPL:  "4.5 SPL Solo Fuad",
		Head: "Mujianto",
	},
	"4.5 Solo Jeffri": {
		SPL:  "4.5 SPL Solo Fuad",
		Head: "Mujianto",
	},
	"4.5 Solo Safrokul": {
		SPL:  "4.5 SPL Solo Fuad",
		Head: "Mujianto",
	},
	"4.5 SPL Solo Fuad": {
		SPL:  "4.5 SPL Solo Fuad",
		Head: "Mujianto",
	},
	"4.5 Sragen M Rizki": {
		SPL:  "4.5 SPL Solo Fuad",
		Head: "Mujianto",
	},
	"4.5 Wonogiri Yulianto": {
		SPL:  "4.5 SPL Solo Fuad",
		Head: "Mujianto",
	},
	"4.6 Cianjur Tedi Permadi": {
		SPL:  "4.6 SPL Sukabumi Rizal",
		Head: "Mujianto",
	},
	"4.6 SPL Sukabumi Rizal": {
		SPL:  "4.6 SPL Sukabumi Rizal",
		Head: "Mujianto",
	},
	"4.6 Sukabumi Chandra": {
		SPL:  "4.6 SPL Sukabumi Rizal",
		Head: "Mujianto",
	},
	"4.6 Sukabumi Ramadhan Gemilang": {
		SPL:  "4.6 SPL Sukabumi Rizal",
		Head: "Mujianto",
	},
	"4.8 Bantul Andri S": {
		SPL:  "4.8 SPL Yogya Bagas",
		Head: "Mujianto",
	},
	"4.8 Bantul Yono": {
		SPL:  "4.8 SPL Yogya Bagas",
		Head: "Mujianto",
	},
	"4.8 Inhouse Yogja Kori": {
		SPL:  "4.8 SPL Yogya Bagas",
		Head: "Mujianto",
	},
	"4.8 Kebumen Erwin Syafaat": {
		SPL:  "4.8 SPL Yogya Bagas",
		Head: "Mujianto",
	},
	"4.8 Kebumen Febrian Pratama": {
		SPL:  "4.8 SPL Yogya Bagas",
		Head: "Mujianto",
	},
	"4.8 Magelang Agustinus Nugroho": {
		SPL:  "4.8 SPL Yogya Bagas",
		Head: "Mujianto",
	},
	"4.8 Sleman Andre Putra": {
		SPL:  "4.8 SPL Yogya Bagas",
		Head: "Mujianto",
	},
	"4.8 Sleman Cucu Iman Suranto": {
		SPL:  "4.8 SPL Yogya Bagas",
		Head: "Mujianto",
	},
	"4.8 Sleman Farhan": {
		SPL:  "4.8 SPL Yogya Bagas",
		Head: "Mujianto",
	},
	"4.8 Sleman Noprianus Dapa": {
		SPL:  "4.8 SPL Yogya Bagas",
		Head: "Mujianto",
	},
	"4.8 SPL Yogya Bagas": {
		SPL:  "4.8 SPL Yogya Bagas",
		Head: "Mujianto",
	},
	"4.8 Yogyakarta Bambang S": {
		SPL:  "4.8 SPL Yogya Bagas",
		Head: "Mujianto",
	},
	"4.8 Yogyakarta Dimas Yusa": {
		SPL:  "4.8 SPL Yogya Bagas",
		Head: "Mujianto",
	},
	"4.8 Yogyakarta M Fasli Budi": {
		SPL:  "4.8 SPL Yogya Bagas",
		Head: "Mujianto",
	},
	"4.8 Yogyakarta Wisnu Prasetyo": {
		SPL:  "4.8 SPL Yogya Bagas",
		Head: "Mujianto",
	},
	"4.9 Bandung Asep Sukmana": {
		SPL:  "4.9 SPL Bandung Roni Koswara",
		Head: "Mujianto",
	},
	"4.9 Bandung Cecep Mulyadi": {
		SPL:  "4.9 SPL Bandung Roni Koswara",
		Head: "Mujianto",
	},
	"4.9 Bandung Hadian Firmansyah": {
		SPL:  "4.9 SPL Bandung Roni Koswara",
		Head: "Mujianto",
	},
	"4.9 Bandung Rizal Hasani": {
		SPL:  "4.9 SPL Bandung Roni Koswara",
		Head: "Mujianto",
	},
	"4.9 Inhouse Bandung Helmy": {
		SPL:  "4.9 SPL Bandung Roni Koswara",
		Head: "Mujianto",
	},
	"4.9 Purwakarta Fajar Awaludin": {
		SPL:  "4.9 SPL Bandung Roni Koswara",
		Head: "Mujianto",
	},
	"4.9 Purwakarta Nasurlloh": {
		SPL:  "4.9 SPL Bandung Roni Koswara",
		Head: "Mujianto",
	},
	"4.9 SPL Bandung Roni Koswara": {
		SPL:  "4.9 SPL Bandung Roni Koswara",
		Head: "Mujianto",
	},
	"4.9 Subang Tursim": {
		SPL:  "4.9 SPL Bandung Roni Koswara",
		Head: "Mujianto",
	},
	"4.9 Sumedang Suwartoyo": {
		SPL:  "4.9 SPL Bandung Roni Koswara",
		Head: "Mujianto",
	},
}

// di controller
func SendReportHandler(db *gorm.DB, dbWeb *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		success, err := GenerateDailyReportTAActivity(db, dbWeb)
		if err != nil {
			c.JSON(500, gin.H{
				"message": "Gagal generate report",
				"error":   err.Error(),
			})
			return
		}

		if success {
			c.JSON(200, gin.H{
				"message": fmt.Sprintf("Berhasil kirim report TA @ %s", time.Now()),
			})
		} else {
			c.JSON(400, gin.H{
				"message": "Gagal generate report, unknown reason",
			})
		}
	}
}

func GenerateDailyReportTAActivity(db *gorm.DB, dbWeb *gorm.DB) (bool, error) {
	excelFileName, excelFilePath, err := GenerateTAExcelReport(db, dbWeb)
	if err != nil {
		return false, err
	}

	if excelFileName == "" && excelFilePath == "" {
		return false, errors.New("no excel found")
	}

	excelFileName2, excelFilePath2, err := GenerateTAMonthlyExcelReport(db)
	if err != nil {
		return false, err
	}

	if excelFileName2 == "" && excelFilePath2 == "" {
		return false, errors.New("no excel monthly found")
	}

	// Send report to email
	emailAttachments := []EmailAttachment{
		{
			FilePath:    excelFilePath,
			NewFileName: excelFileName,
		},
		{
			FilePath:    excelFilePath2,
			NewFileName: excelFileName2,
		},
	}
	config := config.GetConfig()

	emailSubject := fmt.Sprintf("Technical Assistance Log Activity @%v", time.Now().Add(7*time.Hour).Format("02 January 2006"))
	emailMsg := `
		<html>
			<body>
				<i>Dear All,</i><br><br>
				We would like to attach the report regarding the report of ta log activity.<br><br><br>
				Best Regards,<br><br>
				<b><i>PT. Cyber Smart Network Asia</i></b>
			</body>
		</html>`
	err = SendMail(config.Report.To, config.Report.Cc, emailSubject, emailMsg, emailAttachments)
	if err != nil {
		errMsg := fmt.Sprintf("got error while try to send mailer daily ta report :%v", err)
		log.Print(errMsg)
		return false, errors.New(errMsg)
	}

	log.Printf("%v successfully generated and send via email!", excelFileName)
	return true, nil
}

func SendMail(to []string, cc []string, subject string, message string, attachments []EmailAttachment) error {
	config := config.GetConfig()

	m := gomail.NewMessage()

	m.SetHeader("From", fmt.Sprintf("\"%s\" <%s>", "Service Report", config.Email.Username))
	m.SetHeader("To", to...)
	m.SetHeader("Cc", cc...)
	m.SetHeader("Subject", subject)

	m.SetBody("text/html", message)

	for _, attachment := range attachments {
		if _, err := os.Stat(attachment.FilePath); err == nil {
			m.Attach(attachment.FilePath, gomail.Rename(attachment.NewFileName))
		} else {
			log.Printf("File does not exist: %s", attachment.FilePath)
		}
	}

	d := gomail.NewDialer(config.Email.Host, config.Email.Port, config.Email.Username, config.Email.Password)
	d.TLSConfig = &tls.Config{InsecureSkipVerify: true}

	var err error
	for i := 0; i < config.Email.MaxRetry; i++ {
		err = d.DialAndSend(m)
		if err == nil {
			// If no error, email is sent successfully, break out of the loop
			// here u add log to log the mail send !!
			return nil
		}

		log.Printf("Attempt %d/%d failed to send email: %v", i+1, config.Email.MaxRetry, err)
		if i < config.Email.MaxRetry-1 {
			time.Sleep(time.Duration(config.Email.RetryDelay) * time.Second)
		}
	}

	return err
}
