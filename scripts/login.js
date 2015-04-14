var scope;
(function (global) {
    var LoginViewModel, AyarlarViewModel,
        app = global.app = global.app || {};
    var beniHatirlaStorage = true;
    var ipAdres = "localhost";
    angular.module('ogrenciModul', []).controller('ogrenciCTRL', ['$scope', function ($scope) {
        $scope.langSource = source;
        $scope.benihatirlasecimdata = false;
    }]);

    $(function () {
        scope = angular.element(document.getElementById("ogrenciCTRL")).scope();

        $(document).ready(function () {
            if (!checkStorageData(window.localStorage.ipAdres)) {
                window.localStorage.setItem("ipAdres", "localhost");
            }
            else {
                ipAdres = window.localStorage.ipAdres;
            }

            //$("#benihatirla").is(':checked')
            //Beni hatırla data observable
            var BeniHatirlaData = kendo.observable({
                CheckBoxSecimData: beniHatirlaStorage
            });
            kendo.bind($("#BeniHatirla"), BeniHatirlaData);

            BeniHatirlaData.bind("change", function (e) {
                window.localStorage.beniHatirla = e.sender.source.CheckBoxSecimData;
                window.localStorage.removeItem("RNDkullanici");
                window.localStorage.removeItem("RNDsifre");
            });

            var ipAdresData = kendo.observable({
                ipAdres: ipAdres
            });
            kendo.bind($("#ipAdresAyari"), ipAdresData);
        });
    });

    LoginViewModel = kendo.data.ObservableObject.extend({
        isLoggedIn: false,
        Kullanici: checkStorageData(window.localStorage.beniHatirla) 
                            ?  
                                ( window.localStorage.beniHatirla === "true" 
                                    ? 
                                        (checkStorageData(window.localStorage.RNDkullanici)
                                            ?
                                                window.localStorage.RNDkullanici
                                            : ""
                                        )
                                    : ""
                                )
                            : "",
        Sifre: checkStorageData(window.localStorage.beniHatirla)
                            ?
                                (window.localStorage.beniHatirla === "true"
                                    ?
                                        (checkStorageData(window.localStorage.RNDsifre)
                                            ?
                                                window.localStorage.RNDsifre
                                            : ""
                                        )
                                    : ""
                                )
                            : "",
        onLogin: function () {
            var that = this,
                Kullanici = that.get("Kullanici").trim(),
                Sifre = that.get("Sifre").trim();
            
            if (Kullanici === "" && Sifre === "") { $(".erroruser").show(); $(".errorpass").show(); return; } else { $(".erroruser").hide(); $(".errorpass").hide(); }
            if (Kullanici === "") { $(".erroruser").show(); return; } else { $(".erroruser").hide(); }
            if (Sifre === "") { $(".errorpass").show(); return; } else { $(".errorpass").hide(); }
            LogIn(Kullanici, Sifre);
        },
        onInit: function () {
            if (!checkStorageData(window.localStorage.ipAdres)) {
                window.localStorage.setItem("ipAdres", "localhost");
            }
            else {
                ipAdres = window.localStorage.ipAdres;
            }

            if (!checkStorageData(window.localStorage.beniHatirla)) {
                window.localStorage.setItem("beniHatirla", true);
            }
            else {
                beniHatirlaStorage = window.localStorage.beniHatirla === "true" ? true : false;
            }

            $(".erroruser").hide();
            $(".errorpass").hide();
        },
        onLogout: function () {
            var that = this;
            that.clearForm();
            that.set("isLoggedIn", false);
        },
        clearForm: function () {
            var that = this;

            that.set("Kullanici", "");
            that.set("Sifre", "");
        },
        checkEnter: function (e) {
            var that = this;

            if (e.keyCode == 13) {
                $(e.target).blur();
                that.onLogin();
            }
        }
    });
    app.loginService = {
        viewModel: new LoginViewModel()
    };
    app.loginService.viewModel.onInit();
    AyarlarViewModel = kendo.data.ObservableObject.extend({
        MevcutIP: checkStorageData(window.localStorage.ipAdres) ? window.localStorage.ipAdres : "",
        YeniIP: "",
        onSave: function () {
            var that = this,
                yeniIP = that.get("YeniIP").trim();
            window.localStorage.ipAdres = yeniIP;
            that.set("YeniIP", "");
            that.set("MevcutIP", yeniIP);
            app.application.navigate("#view-giris", "slide:right");
        },
        onInit: function () {
            $('#mevcutservisip').attr('readonly', true);
        },
    });
    app.ayarlarService = {
        viewModel: new AyarlarViewModel()
    };
    app.ayarlarService.viewModel.onInit();
})(window);

function LogIn(Kullanici, Sifre) {
    $.ajax({
        type: "POST",
        url: app.endpoints.login,
        data: { "Kullanici": Kullanici, "Sifre": Sifre },
        beforeSend: function () { app.application.showLoading(); },
        complete: function () { app.application.hideLoading(); },
        dataType: "json",
        crossDomain: true,
        success: function (jsonData) {
            app.application.hideLoading();
            if (!(jsonData === undefined || jsonData === null || jsonData === "")) {
                if (checkStorageData(window.localStorage.beniHatirla)) {
                    if (window.localStorage.beniHatirla === "true") {
                        window.localStorage.RNDkullanici = Kullanici;
                        window.localStorage.RNDsifre = Sifre;
                    }
                    else {
                        window.localStorage.removeItem("RNDkullanici");
                        window.localStorage.removeItem("RNDsifre");
                    }
                }
                window.localStorage.accessToken = jsonData.accessToken;
                window.localStorage.SadeceOkusun = jsonData.sadeceokusun;
                window.localStorage.OzelRandevularGozuksun = jsonData.ozelrandevulargozuksun;
                //console.log($("#benihatirla").is(':checked'));
                window.location = "IndexLogged.html";
            }
            else {
                alert(jsonData.mesaj);
            }
        },
        error: function (e) {
            alert(e.statusText);
            alert("Giriş işlemi sırasında bir hata oldu. Lütfen tekrar deneyiniz.");
        }
    });
};

//LocalStorage'da datanın varlığına bakılır.
function checkStorageData(data) {
    if (data === undefined || data === null || data === "")
        return false;
    else return true;
};

function AyarlarYonlendir() {
    scope.$apply(function () {
        scope.MevcutServisIP = window.localStorage.ipAdres;
    });
    app.application.navigate("#view-ayarlar", "slide:left");
};

function iptalButton() {
    app.application.navigate("#view-giris", "slide:right");
};