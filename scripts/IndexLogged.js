var scope, token, AjandaDataSource;
app = window.app = window.app || {};

angular.module('ogrenciModul', []).controller('ogrenciCTRL', ['$scope', function ($scope) {
    $scope.Tarih = (new Date()).format("dd.mm.yyyy");
    $scope.langSource = source;
    $scope.RandevuTipi = 1; // Default randevu tipi 1 : Resmi ; 2 : Özel
    $scope.DataEklemeYetkisi = true; //Default data ekleme yetkisi false : Data Ekleyemez (ReadOnly); true : Data Ekleyebilir
    $scope.Randevular = [];
    $scope.Arayanlar = [];
    $scope.AjandaRandevular = [];
    $scope.SecilenRandevu = "";
    $scope.SecilenArayan = "";

    $scope.Set_Color = function (payment) {
        if (payment == "1") {
            return { color: "white" }
        }
        else if (payment == "2") {
            return { color: "#CCE0FF" }
        }
        else if (payment == "3") {
            return { color: "#f35800" } //Koyu Turuncu #DF5900
        }
        else if (payment == "4") {
            return { color: "red" }
        }
        else {
            return { color: "white" }
        }
    }
    $scope.SecilenRandevuDetay = function (randevu) {
        scope.SecilenRandevu = randevu;
        app.application.navigate("#view-randevudetay", "slide:left");
    }
    $scope.SecilenArayanDetay = function (arayan) {
        scope.SecilenArayan = arayan;
        app.application.navigate("#view-arayandetay", "slide:left");
    }
    $scope.SecilenRandevuAciklamaEkle = function () {
        var YeniAciklama = $("#secilen-randevu-aciklama-input")[0].value;
        if (YeniAciklama.trim() == "") {
            alert("Kaydet butonuna basmadan önce Açıklama Yazınız!");
        }
        else {
            $.ajax({
                type: "POST",
                data: {
                    "accessToken": token,
                    "SecilenRandevuId": scope.SecilenRandevu.Id,
                    "BaskanAciklamasi": YeniAciklama.toString(),
                    "MevcutRandevuAciklama": scope.SecilenRandevu.Aciklama
                },
                url: app.endpoints.randevudetayaciklamaekle,
                dataType: "json",
                crossDomain: true,
                success: function (result) {
                    if (result === true) {
                        $("#secilen-randevu-aciklama-input")[0].value = "";
                        GetRandevuKayit(token, scope.Tarih, scope.RandevuTipi);
                    }
                    else {
                        alert("Randevu açıklama eklenirken bir hata meydana geldi. Lütfen tekrar deneyiniz");
                    }
                },
                error: function () {
                    alert("Randevu açıklama eklenirken bir hata meydana geldi.");
                }
            });
        }
    }
    $scope.SecilenArayanSonucEkle = function () {
        var YeniSonuc = $("#secilen-arayan-sonuc-input")[0].value;
        if (YeniSonuc.trim() == "") {
            alert("Kaydet butonuna basmadan önce Sonuç Yazınız!");
        }
        else {
            $.ajax({
                type: "POST",
                data: {
                    "accessToken": token,
                    "SecilenArayanId": scope.SecilenArayan.Id,
                    "BaskanSonuc": YeniSonuc.toString(),
                    "MevcutArayanSonuc": scope.SecilenArayan.Sonuc
                },
                url: app.endpoints.arayandetaysonucekle,
                dataType: "json",
                crossDomain: true,
                success: function (result) {
                    if (result === true) {
                        $("#secilen-arayan-sonuc-input")[0].value = "";
                        GetArayanKayit(token, scope.Tarih);
                    }
                    else {
                        alert("Arayan sonuç eklenirken bir hata meydana geldi. Lütfen tekrar deneyiniz");
                    }
                },
                error: function () {
                    alert("Arayan sonuç eklenirken bir hata meydana geldi.");
                }
            });
        }
    }
}]);

$(function () {
    AjaxSetup();

    token = window.localStorage.getItem("accessToken");

    if (!(checkStorageData(token)))
        gotoIndexPage();
    scope = angular.element(document.getElementById("ogrenciCTRL")).scope();

    $(function () {
        kendo.culture('tr-TR');
    });

    $(document).ready(function () {
        GetRandevuKayit(token, scope.Tarih, scope.RandevuTipi);
        $("#RandevuDatePicker").kendoDatePicker({
            value: GetTarihByString(scope.Tarih),
            //format: "dd.mm.yyyy",
            culture: "tr-TR",
            change: function () {
                var value = this.value();
                scope.$apply(function () {
                    scope.Tarih = (value).format("dd.mm.yyyy");
                });
                AjandaTarihDegistir(scope.Tarih);
                GetRandevuKayit(token, scope.Tarih, scope.RandevuTipi);
            }
        });

        $("#ArayanDatePicker").kendoDatePicker({
            value: GetTarihByString(scope.Tarih),
            //format: "dd.mm.yyyy",
            culture: "tr-TR",
            change: function () {
                var value = this.value();
                scope.$apply(function () {
                    scope.Tarih = (value).format("dd.mm.yyyy");
                });
                AjandaTarihDegistir(scope.Tarih);
                GetArayanKayit(token, scope.Tarih);
            }
        });

        $(document).on("click", "#randevu-datepicker-button", function () {
            $("#RandevuDatePicker").data("kendoDatePicker").open();
        });

        $(document).on("click", "#arayan-datepicker-button", function () {
            $("#ArayanDatePicker").data("kendoDatePicker").open();
        });

        $(document).on("click", "#dun-button", function () {
            scope.$apply(function () {
                scope.Tarih = decreaseFromDate(scope.Tarih);
            });
            $("#RandevuDatePicker").data("kendoDatePicker").value(scope.Tarih);
            AjandaTarihDegistir(scope.Tarih);
            DurumaGoreDataGetir(window.location.hash);
        });

        $(document).on("click", "#bugun-button", function () {
            scope.$apply(function () {
                scope.Tarih = (new Date()).format("dd.mm.yyyy");
            });
            $("#RandevuDatePicker").data("kendoDatePicker").value(scope.Tarih);
            AjandaTarihDegistir(scope.Tarih);
            DurumaGoreDataGetir(window.location.hash);
        });

        $(document).on("click", "#yarin-button", function () {
            scope.$apply(function () {
                scope.Tarih = increaseFromDate(scope.Tarih);
            });
            $("#RandevuDatePicker").data("kendoDatePicker").value(scope.Tarih);
            AjandaTarihDegistir(scope.Tarih);
            DurumaGoreDataGetir(window.location.hash);
        });
        
        /*---------------------------  EKRANLAR    ----------------------*/
        $(document).on("click", "#view-ekranlar-randevular", function () {
            GetRandevuKayit(token, scope.Tarih, scope.RandevuTipi);
        });

        $(document).on("click", "#view-ekranlar-arayanlar", function () {
            GetArayanKayit(token, scope.Tarih);
        });

        $(document).on("click", "#view-ekranlar-ajanda", function () {
            kendo.culture('tr-TR');
            app.application.navigate("#view-ajanda", "none");
            if ($("#Scheduler")[0].dataset.role !== "scheduler") {
                AjandaRandevuCRUDData(token);
                KendoScheduler();
            }
            else {
                AjandaTarihDegistir(scope.Tarih);
                DurumaGoreDataGetir(window.location.hash);
            }
        });

        $(document).on("click", "#view-hesap-ayarlar", function () {
            console.log("Ayarlar Ekranı");
            app.application.navigate("#view-ayarlar", "none");
            SetSettingsResmiOzelRandevuIcon();
        });

        $(document).on("click", "#view-hesap-oturumukapat", function () {
            $.ajax({
                type: "POST",
                data: {
                    "accessToken": token
                },
                url: app.endpoints.cikis,
                dataType: "json",
                beforeSend: function () { app.application.showLoading(); },
                complete: function () {
                    app.application.hideLoading();
                    window.localStorage.removeItem("accessToken");
                    window.location = "index.html";
                },
                crossDomain: true,
                success: function (result) {
                }
            });
        });
    });
});

function checkStorageData(data) {
    //LocalStorage'da datanın varlığına bakılır.
    if (data === undefined || data === null || data === "")
        return false;
    else return true;
};

function AjaxSetup() {
    //AjaxSetup
    $.ajaxSetup({
        beforeSend: function () { app.application.showLoading(); },
        complete: function () { app.application.hideLoading(); },
        error: function (jqXHR, exception) {
            if (jqXHR.status === 0) {
                navigator.notification.alert("Uygulama internet bağlantısı gerektirir.", function () {
                    navigator.app.exitApp();
                }, "Bağlantı Hatası", 'Tamam');
            } else if (jqXHR.status == 404) {
                alert("Servis noktası bulunamadı.");
            } else if (jqXHR.status >= 500) {
                alert("Serviste sunucu hatası.");
            } else if (exception === 'parsererror') {
                alert("Servisten dönen kayıt hatalı.");
            } else if (exception === 'timeout') {
                alert("İstek zaman aşımına uğradı.");
            } else if (exception === 'abort') {
                alert("İstek iptal edildi.");
            } else {
                alert("Beklenmedik bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.");
            }
        }
    });
};

function gotoIndexPage() {
    window.location = "index.html";
};

function isNullUndefinedOrEmpty(value) {
    /// <summary>Gelen değerin null, undefined veya empty ('') olması durumunu inceleyen method</summary>
    /// <param name="value" type="string">kullanılan string değeri.</param>
    if (value === null || value === undefined || value === "") return true;
    else return false;
};

function decreaseFromDate(tar) {
    //Date decrease :
    var dateString = (tar).split('.');
    var date = new Date(dateString[2], parseInt(dateString[1]) - 1, dateString[0]);
    return (formatDate(addDays(date, -1)));
}

function increaseFromDate(tar) {
    //Date increase :
    var fromDateString = (tar).split('.');
    var fromDate = new Date(fromDateString[2], parseInt(fromDateString[1]) - 1, fromDateString[0]);
    return (formatDate(addDays(fromDate, 1)));
}

function formatDate(date) {
    return ("00" + date.getDate()).slice(-"00".length) + '.' + ("00" + (date.getMonth() + 1)).slice(-"00".length) + '.' + date.getFullYear();
}

function addDays(date, days) {
    var today = new Date(date);
    var tomorrow = new Date();
    tomorrow.setTime(today.getTime() + (days * 24 * 60 * 60 * 1000));
    return tomorrow;
};

function AjandaTarihDegistir(tar) {
    var tarih = GetTarihByString(tar);
    if ($("#Scheduler")[0].dataset.role === "scheduler") {
        $("#Scheduler").data("kendoScheduler").date(tarih);
    }
};

function GetTarihByString(tar) {
    var dizi = tar.split(".");
    return new Date(dizi[2], (dizi[1] - 1), dizi[0]);
};

function GetRandevuKayit(accesstoken, tarih, randevutipi) {
    $.ajax({
        type: "POST",
        data: {
            "accessToken": accesstoken,
            "Tarih": tarih,
            "RandevuTipi": randevutipi
        },
        url: app.endpoints.getrandevular,
        dataType: "json",
        beforeSend: function () { app.application.showLoading(); },
        complete: function () { app.application.hideLoading(); },
        crossDomain: true,
        success: function (jsonData) {
            app.application.hideLoading();
            app.application.navigate("#view-randevular", "none");
            if (!(jsonData === undefined || jsonData === null || jsonData === "")) {
                scope.$apply(function () {
                    scope.Randevular = jsonData;
                });
            }
            else {
                alert("Randevu verileri alınırken bir hata oldu. Lütfen tekrar deneyiniz.");
                location.reload();
            }
        },
        error: function (e) {
            alert(e.statusText);
            alert("Randevu verileri alınırken bir hata oldu. Lütfen tekrar deneyiniz.");
        }
    });
};

function GetArayanKayit(accesstoken, tarih) {
    $.ajax({
        type: "POST",
        data: {
            "accessToken": accesstoken,
            "Tarih": tarih
        },
        url: app.endpoints.getarayanlar,
        dataType: "json",
        beforeSend: function () { app.application.showLoading(); },
        complete: function () { app.application.hideLoading(); },
        crossDomain: true,
        success: function (jsonData) {
            app.application.hideLoading();
            app.application.navigate("#view-arayanlar", "none");
            if (!(jsonData === undefined || jsonData === null || jsonData === "")) {
                scope.$apply(function () {
                    scope.Arayanlar = jsonData;
                });
            }
            else {
                alert("Arayan verileri alınırken bir hata oldu. Lütfen tekrar deneyiniz.");
                location.reload();
            }
        },
        error: function (e) {
            alert(e.statusText);
            alert("Arayan verileri alınırken bir hata oldu. Lütfen tekrar deneyiniz.");
        }
    });
};

function DurumaGoreDataGetir(hash) {
    if (hash === "#view-randevular") {
        GetRandevuKayit(token, scope.Tarih, scope.RandevuTipi);
    }
    if (hash === "#view-arayanlar") {
        GetArayanKayit(token, scope.Tarih);
    }
    if (hash === "#view-ajanda") {
        AjandaDataSource.read();
    }
};

function RandevuAciklamaIptalButton() {
    $("#secilen-randevu-aciklama-input")[0].value = "";
    app.application.navigate("#:back", "slide:right");
};

function ArayanSonucIptalButton() {
    $("#secilen-arayan-sonuc-input")[0].value = "";
    app.application.navigate("#:back", "slide:right");
};

function GetAjandaRandevular(accessToken, tarih) {
    $.ajax({
        type: "POST",
        data: {
            "accessToken": accessToken,
            "Tarih": tarih,
            "RandevuTipi": scope.RandevuTipi
        },
        url: app.endpoints.getajandarandevular,
        dataType: "json",
        beforeSend: function () { app.application.showLoading(); },
        complete: function () { app.application.hideLoading(); },
        crossDomain: true,
        success: function (jsonData) {
            app.application.hideLoading();
            
            if (!(jsonData === undefined || jsonData === null || jsonData === "")) {
                for (var i = 0; i < jsonData.length; i++) {
                    jsonData[i].BaslamaTarihi = new Date((new Date(jsonData[i].BaslamaTarihi)).setHours(getSaat(jsonData[i].BaslamaSaati), getDakika(jsonData[i].BaslamaSaati)));
                    //DB de her ihtimale karşı bitiş saati girilmediyse başlangıç saatinden 1 saat sonraya bitiş tarihi atanır.
                    jsonData[i].BitisTarihi = new Date((new Date(jsonData[i].BitisTarihi)).setHours(getSaat(jsonData[i].BitisSaati) == "" ? parseInt(getSaat(jsonData[i].BaslamaSaati)) + 1 : getSaat(jsonData[i].BitisSaati), getDakika(jsonData[i].BitisSaati) == "" ? getDakika(jsonData[i].BaslamaSaati) : getDakika(jsonData[i].BitisSaati)));
                }

                scope.$apply(function () {
                    scope.AjandaRandevular = jsonData;
                });
                console.log(scope.AjandaRandevular);
                //options.success(jsonData);


            }
            else {
                alert("Randevu verileri alınırken bir hata oldu. Lütfen tekrar deneyiniz.");
                location.reload();
            }
        },
        error: function (e) {
            alert(e.statusText);
            alert("Randevu verileri alınırken bir hata oldu. Lütfen tekrar deneyiniz.");
        }
    });
};

function KendoScheduler() {
    kendo.culture('tr-TR');
    if ($("#Scheduler")[0].dataset.role !== "scheduler") {
        $("#Scheduler").kendoScheduler({
            date: GetTarihByString(scope.Tarih), //new Date(today),/*new Date("2014/01/16"),*/
            startTime: new Date("2013/6/13 8:00"),
            endTime: new Date("2013/6/13 22:00"),
            height: $(window).height(),
            majorTick: 60,                  // Soldaki saat aralığı.(1 saat)
            showWorkHours: false,           // İlk açılışta mesai saatlerini göstermesin tümünü göstersin.
            allDaySlot: false,              // Gridin üstüne allDay satırını kaldırır.
            minorTickCount: 2,             // İki saat arasının kaç aralığa bölünmesi gerektiğini setler.
            views: [
                { type: "day" },
                { type: "week", selectedDateFormat: "{0:dd.MM.yyyy} - {1:dd.MM.yyyy}" },
                { type: "month" },
                { type: "agenda", selected: true, selectedDateFormat: "{0:dd.MM.yyyy} - {1:dd.MM.yyyy}" }
            ],
            //edit: scheduler_edit,
            editable: {
                update: scope.DataEklemeYetkisi,
                destroy: false,
                create: scope.DataEklemeYetkisi,
                template: kendo.template($("#scheduler-template").html())
            },
            eventTemplate: $("#event-template").html(),             //Gridde gösterilecek randevu içeriği.
            mobile: "phone",
            timezone: "Etc/UTC",                                    //Datepicker durumu.
            footer: false,
            messages: {                                             //Mesai saatleri göster butonu yazısını günceller.
                showWorkDay: "Mesai Saatlerini Göster",
                showFullDay: "Tüm Günü Göster",
                allDay: "Gün",
                cancel: "Vazgeç",
                deleteWindowTitle: "Randevu Sil",
                destroy: "Sil",
                save: "Kaydet",
                today: "Bugün",
                editor: {
                    //allDayEvent: "All Day event",            //Editable:true iken açılan kısımda alldayevent check box text yazısı
                    allDayEvent: false,
                    description: "Konusu",                   //Editable:true iken açılan kısımda description text yazısı
                    editorTitle: "Randevu Düzenle",
                    start: "Başlama Saati",
                    end: "Bitiş Saati",
                    endTimezone: "End date timezone",
                    repeat: "Repeat the event",
                    title: "Randevu Yeri"   //Yeni event eklerken title text yazısı.
                },
                views: {
                    day: "Gün",
                    week: "Hafta",
                    month: "Ay",
                    agenda: "Ajanda"
                }
            },
            dataBound: function (e) {
                //Bugün butonunu görselden kaldırır.
                e.sender.toolbar[0].childNodes[0].style.display = "none";
                //Toolbar Gün,Hafta,Ay ve Ajanda butonlarını ortalar
                e.sender.toolbar[0].childNodes[1].style.width = "100%";
                //Toolbar ileri ve geri butonlarını kaldırır
                /*e.sender.toolbar[1].childNodes[0].childNodes[0].style.display = "none";
                e.sender.toolbar[1].childNodes[0].childNodes[2].style.display = "none";*/
                
                //Schedulerin mevcut tarihini alır.
                //$("#Scheduler").data("kendoScheduler").date();
                //e.sender._model.selectedDate

                //Ajandada tarih değiştirildiği zaman genel tarihin güncellenmesi.
                scope.$apply(function () {
                    scope.Tarih = (e.sender._model.selectedDate).format("dd.mm.yyyy");
                });
                //KendoDatePicker Tarihini günceller
                $("#RandevuDatePicker").data("kendoDatePicker").value(scope.Tarih);
            },
            dataSource: AjandaDataSource
        });
    }
    else {
        AjandaDataSource.read();
    }
}

function AjandaRandevuCRUDData(accessToken) {
    var dataal;
    //------------------------------------------------------------
    AjandaDataSource = new kendo.data.SchedulerDataSource({
        batch: true,
        data: dataal,
        transport: {
            read: function (options) {
                $.ajax({
                    type: "POST",
                    data: {
                        "accessToken": accessToken,
                        "Tarih": scope.Tarih,
                        "RandevuTipi": scope.RandevuTipi
                    },
                    url: app.endpoints.getajandarandevular,
                    dataType: "json",
                    beforeSend: function () { app.application.showLoading(); },
                    complete: function () { app.application.hideLoading(); },
                    crossDomain: true,
                    success: function (jsonData) {
                        app.application.hideLoading();
                        if (!(jsonData === undefined || jsonData === null || jsonData === "")) {
                            scope.$apply(function () {
                                scope.AjandaRandevular = jsonData;
                            });
                            options.success(scope.AjandaRandevular);
                            $("#Scheduler").data("kendoScheduler").refresh();
                            $("#Scheduler").data("kendoScheduler").rebind();
                        }
                        else {
                            alert("Randevu verileri alınırken bir hata oldu. Lütfen tekrar deneyiniz.");
                            location.reload();
                        }
                    },
                    complete: function(){
                        $("#Scheduler").data("kendoScheduler").refresh();
                    },
                    error: function (e) {
                        alert(e.statusText);
                        alert("Randevu verileri alınırken bir hata oldu. Lütfen tekrar deneyiniz.");
                    }
                });
            },
            update: function (options) {
                var basTarihi = (options.data.models[0].BaslamaTarihi).format("dd.mm.yyyy"); 
                var bitTarihi = (options.data.models[0].BitisTarihi).format("dd.mm.yyyy"); 

                var basSaati = (((options.data.models[0].BaslamaTarihi.toString()).split(" "))[4].toString()).split(":");
                var bitSaati = (((options.data.models[0].BitisTarihi.toString()).split(" "))[4].toString()).split(":");
                basSaati = basSaati[0] + ":" + basSaati[1];
                bitSaati = bitSaati[0] + ":" + bitSaati[1];
                
                $.ajax({
                    type: "POST",
                    url: app.endpoints.ajandarandevuguncelle,
                    data: {
                        "accessToken": accessToken,
                        "Id": options.data.models[0].Id.toString(),
                        "BaslamaTarihiStr": basTarihi.toString(),
                        "BitisTarihiStr": bitTarihi.toString(),
                        "BaslamaSaati": basSaati.toString(),
                        "BitisSaati": bitSaati.toString(),
                        "Konu": options.data.models[0].Konu,
                        "Katilimcilar": options.data.models[0].Katilimcilar,
                        "YerId": "1",
                        "TuruId": "2",
                        "Hatirlatma": options.data.models[0].Hatirlatma,
                        "Aciklama": options.data.models[0].Aciklama,
                        "TalepEden": options.data.models[0].TalepEden,
                        "Telefon": options.data.models[0].Telefon,
                        "Email": options.data.models[0].Email,
                        "Yeri": options.data.models[0].Yeri,
                        "Adres": options.data.models[0].Adres,
                        "KonuRenk": "1",
                        "HatirlatmaRenk": "2",
                        "KatilimciRenk": "3",
                        "Silindi": "0",
                        "RandevuTipi": scope.RandevuTipi
                    },
                    dataType: "json",
                    beforeSend: function () { app.application.showLoading(); },
                    complete: function () { app.application.hideLoading(); },
                    crossDomain: true,
                    success: function (result) {
                        if (result === true) {
                            //options.success(result.Randevular);
                            AjandaDataSource.read();
                            $("#Scheduler").data("kendoScheduler").refresh();
                        }
                        else {
                            alert("Randevu güncellenirken bir hata meydana geldi. Lütfen tekrar deneyiniz.");
                            location.reload();
                        }
                    },
                    error: function () {
                        alert("Randevu güncelleme sırasında bir hata meydana geldi. Lütfen tekrar deneyiniz..");
                        location.reload();
                    }
                });
            },
            create: function (options) {
                var basTarihi = (options.data.models[0].BaslamaTarihi).format("dd.mm.yyyy");
                var bitTarihi = (options.data.models[0].BitisTarihi).format("dd.mm.yyyy");

                var basSaati = (((options.data.models[0].BaslamaTarihi.toString()).split(" "))[4].toString()).split(":");
                var bitSaati = (((options.data.models[0].BitisTarihi.toString()).split(" "))[4].toString()).split(":");
                basSaati = basSaati[0] + ":" + basSaati[1];
                bitSaati = bitSaati[0] + ":" + bitSaati[1];

                $.ajax({
                    type: "POST",
                    data: {
                        "accessToken": accessToken,
                        "BaslamaTarihiStr": basTarihi.toString(),
                        "BitisTarihiStr": bitTarihi.toString(),
                        "BaslamaSaati": basSaati.toString(),
                        "BitisSaati": bitSaati.toString(),
                        "Konu": options.data.models[0].Konu,
                        "Katilimcilar": options.data.models[0].Katilimcilar,
                        "YerId": "1",
                        "TuruId": "2",
                        "Hatirlatma": options.data.models[0].Hatirlatma,
                        "Aciklama": options.data.models[0].Aciklama,
                        "TalepEden": options.data.models[0].TalepEden,
                        "Telefon": options.data.models[0].Telefon,
                        "Email": options.data.models[0].Email,
                        "Yeri": options.data.models[0].Yeri,
                        "Adres": options.data.models[0].Adres,
                        "KonuRenk": "1",
                        "HatirlatmaRenk": "2",
                        "KatilimciRenk": "3",
                        "Silindi": "0",
                        "RandevuTipi": scope.RandevuTipi
                    },
                    url: app.endpoints.ajandaRandevuEkle,
                    dataType: "json",
                    beforeSend: function () { app.application.showLoading(); },
                    complete: function () { app.application.hideLoading(); },
                    crossDomain: true,
                    success: function (result) {
                        if (result === true) {
                            //options.success(result.Randevular);
                            AjandaDataSource.read();
                            $("#Scheduler").data("kendoScheduler").refresh();
                        }
                        else {
                            alert("Randevu eklenirken bir hata meydana geldi. Lütfen tekrar deneyiniz.");
                            location.reload();
                        }
                    },
                    error: function () {
                        alert("Yeni kayıt oluşumu sırasında bir hata meydana geldi.");
                    }
                });
            }
        },
        schema: {
            model: {
                id: "taskId",
                fields: {
                    taskId: { from: "Id", type: "number" },
                    start: { from: "BaslamaTarihi", type: "date" },
                    end: { from: "BitisTarihi", type: "date" },
                    baslamaSaati: { from: "BaslamaSaati" },
                    bitisSaati: { from: "BitisSaati" },
                    description: { from: "Konu" },
                    katilimcilar: { from: "Katilimcilar" },
                    yerId: { from: "YerId" },
                    turuid: { from: "TuruId" },
                    hatirlatma: { from: "Hatirlatma" },
                    aciklama: { from: "Aciklama" },
                    talepEden: { from: "TalepEden" },
                    telefon: { from: "Telefon" },
                    email: { from: "Email" },
                    title: { from: "Yeri", defaultValue: "", validation: { required: true } },
                    adres: { from: "Adres" },
                    konuRenk: { from: "KonuRenk" },
                    hatirlatmaRenk: { from: "HatirlatmaRenk" },
                    katilimciRenk: { from: "KatilimciRenk" },
                    silindi: { from: "Silindi" },
                    yoneticiId: { from: "YoneticiId" },
                    randevuTipi: { from: "RandevuTipi", type: "number", defaultValue: 1, validation: { required: true } }
                }
            }
        }
    });
};

function initPullToRefreshScroller(e) {
    var scroller = e.view.scroller;
    scroller.setOptions({
        pullToRefresh: true,
        pullTemplate: source.yenilemekicincekin,
        refreshTemplate: source.yenileniyor,
        releaseTemplate: source.yenilemekicinbirakin,
        useNative: true,
        zoom: true,
        pull: function () {
            DurumaGoreDataGetir(window.location.hash);
            //location.reload();
            setTimeout(function () { scroller.pullHandled(); }, 1000);
        }
    });
};

function selectResmiOzelRandevuButton() {
    if (this.selectedIndex === 0) {
        scope.$apply(function () {
            scope.RandevuTipi = 1;
        });
    }
    if (this.selectedIndex === 1) {
        scope.$apply(function () {
            scope.RandevuTipi = 2;
        });
    }
};

function SetSettingsResmiOzelRandevuIcon() {
    ($("#button-group-resmiozelrandevu").data("kendoMobileButtonGroup")).select(scope.RandevuTipi - 1);
};

function getSaat(value) {
    return (((value.split(":"))[0]).trim()).toString();
};

function getDakika(value) {
    return (((value.split(":"))[1]).trim()).toString();
};

