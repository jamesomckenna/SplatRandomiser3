window.addEventListener("load", (event) => {
    console.log("Page Loaded");

    let main_shell = document.getElementById("main_shell");
    let randomise_btn = document.getElementById("randomise_btn");
    let weapon_name = document.getElementById("weapon_name");
    let weapon_img = document.getElementById("weapon_img");
    let sub_name = document.getElementById("sub_name");
    let sub_img = document.getElementById("sub_img");
    let special_name = document.getElementById("special_name");
    let special_img = document.getElementById("special_img");
    let special_points = document.getElementById("special_points");
    let stat_name_1 = document.getElementById("stat_name_1");
    let stat_name_2 = document.getElementById("stat_name_2");
    let stat_name_3 = document.getElementById("stat_name_3");
    let stat_val_1 = document.getElementById("stat_val_1");
    let stat_val_2 = document.getElementById("stat_val_2");
    let stat_val_3 = document.getElementById("stat_val_3");

    let loading_screen = document.getElementById("loading_screen");
    let loading_bar = document.getElementById("loading_bar");
    let loading_value = document.getElementById("loading_value");

    let side_menu = document.getElementById("side-menu");
    let weapon_select_btn = document.getElementById("weapon_select_btn");
    let side_menu_close = document.getElementById("side-menu__close");
    let side_menu_background = document.getElementById("side-menu__background");
    let weapon_select_container = document.getElementById("weapon_select_container");
    let weapon_card_list = document.getElementsByClassName("weapon-card--weapon");
    let weapon_card_class_list = document.getElementsByClassName("weapon-card--class");

    let weapon_list, sub_list, special_list, class_list;
    let data_promises = [];
    let img_promises = [];

    data_promises.push(fetch("dist/json/weapons.json")
        .then((response) => response.json())
        .then((json) => weapon_list = json));

    data_promises.push(fetch("dist/json/subs.json")
        .then((response) => response.json())
        .then((json) => sub_list = json));

    data_promises.push(fetch("dist/json/specials.json")
        .then((response) => response.json())
        .then((json) => special_list = json));

    data_promises.push(fetch("dist/json/classes.json")
        .then((response) => response.json())
        .then((json) => class_list = json));

    Promise.all(data_promises).then(d => {
        console.log("Data Loaded");

        let load_img_progress = 0;
        let load_img_total = weapon_list.length + Object.keys(sub_list).length + Object.keys(special_list).length + Object.keys(class_list).length;

        for (key in class_list) {
            class_list[key].img_obj = new Image(90, 90);
            class_list[key].img_obj.alt = class_list[key].name;
            class_list[key].img_obj.src = "dist/images/class/" + class_list[key].img + ".webp";

            img_promises.push(class_list[key].img_obj.decode()
                .then(() => {
                    update_load_screen();
                }));
        }

        weapon_list.sort(sort_weapons_alphabetically);
        weapon_list.forEach((weapon, index) => {
            let img_src = "dist/images/weapons/" + weapon.img + ".webp";
            weapon_list[index].img_obj = new Image(205, 205);
            weapon_list[index].img_obj.alt = weapon.name;
            weapon_list[index].img_obj.src = img_src;

            img_promises.push(weapon_list[index].img_obj.decode()
                .then(() => {
                    update_load_screen();
                }));
        });

        for (key in sub_list) {
            sub_list[key].img_obj = new Image(71, 71);
            sub_list[key].img_obj.alt = sub_list[key].name;
            sub_list[key].img_obj.src = "dist/images/sub/" + sub_list[key].img + ".webp";

            img_promises.push(sub_list[key].img_obj.decode()
                .then(() => {
                    update_load_screen();
                }));
        }

        for (key in special_list) {
            special_list[key].img_obj = new Image(71, 71);
            special_list[key].img_obj.alt = special_list[key].name;
            special_list[key].img_obj.src = "dist/images/special/" + special_list[key].img + ".webp";

            img_promises.push(special_list[key].img_obj.decode()
                .then(() => {
                    update_load_screen();
                }));
        }

        Promise.all(img_promises).then(d => {
            console.log("Images Loaded");

            //add weapon checkbox
            for (key in class_list) {
                class_list[key].container = add_weapon_class_group(key, class_list[key].name, class_list[key].img_obj);
            };

            //add weapon checkbox
            weapon_list.forEach((element, index) => {
                add_weapon_checkbox(index, element.name, class_list[weapon_list[index].class].container);
            });

            // init toggle functions for cards
            for (let i = 0; i < weapon_card_list.length; i++) {
                weapon_card_list[i].addEventListener("click", function () {
                    if (this.dataset.selected == "true") {
                        this.dataset.selected = "false"
                    } else {
                        this.dataset.selected = "true";
                    }
                });
            }

            for (let i = 0; i < weapon_card_class_list.length; i++) {
                weapon_card_class_list[i].addEventListener("click", function () {
                    let toggle = "";
                    if (this.dataset.selected == "true") {
                        this.dataset.selected = "false";
                        toggle = "OFF"
                    } else {
                        this.dataset.selected = "true";
                        toggle = "ON"
                    }
                    this.children[1].innerHTML = "ALL <br>" + this.dataset.class.toUpperCase() + "<br>" + toggle;

                    let class_group = this.dataset.class;
                    let selected = this.dataset.selected;

                    for (let j = 0; j < weapon_card_list.length; j++) {
                        if (weapon_list[weapon_card_list[j].dataset.id].class == class_group || class_group == "weapons") {
                            weapon_card_list[j].dataset.selected = selected;
                        }
                    }

                    if (class_group == "weapons") {
                        for (let j = 0; j < weapon_card_class_list.length; j++) {
                            weapon_card_class_list[j].dataset.selected = selected;
                            weapon_card_class_list[j].children[1].innerHTML = "ALL <br>" + weapon_card_class_list[j].dataset.class.toUpperCase() + "<br>" + toggle;
                        }
                    }
                });
            }

            randomise_weapon();
            randomise_btn.disabled = false;
            loading_screen.style.display = "none";
        });

        function update_load_screen() {
            load_img_progress++;
            let progress = Math.floor((load_img_progress / load_img_total) * 100) + "%";
            loading_bar.style.width = progress;
            loading_value.innerHTML = progress;
        }
    }).catch(e => {
        console.log("Error: Unable to obtain data", e);
    });


    function sort_weapons_alphabetically(a, b) {
        if (a.name < b.name) {
            return -1;
        } else if (a.name > b.name) {
            return 1;
        } else {
            return 0;
        }
    }

    function add_weapon_class_group(class_id, class_name, class_img_obj) {
        let card_container = document.createElement("div");
        let card = document.createElement("button");
        let name = document.createElement("span");

        card_container.classList.add("weapon-class");
        card_container.dataset.class = class_id;
        card.classList.add("weapon-card");
        card.classList.add("weapon-card--class");
        card.dataset.selected = "true";
        card.dataset.class = class_id;
        class_img_obj.classList.add("weapon-card__img");
        name.classList.add("weapon-card__name");
        name.innerHTML = "ALL<br>" + class_name.toUpperCase() + "<br>ON"

        card.appendChild(class_img_obj);
        card.appendChild(name);
        card_container.appendChild(card);
        weapon_select_container.appendChild(card_container);
        return card_container;
    }

    function add_weapon_checkbox(weapon_index, weapon_name, card_container) {
        let card = document.createElement("button");
        let img = new Image(90, 90);
        let name = document.createElement("span");

        card.classList.add("weapon-card");
        card.classList.add("weapon-card--weapon");
        card.dataset.selected = "true";
        card.dataset.id = weapon_index;
        img.alt = "";
        img.src = "dist/images/weapons/" + weapon_list[weapon_index].img + "-small.webp";
        img.classList.add("weapon-card__img");
        img.setAttribute("loading", "lazy");
        name.classList.add("weapon-card__name");

        name.innerHTML = weapon_name;
        card.appendChild(img);
        card.appendChild(name);
        card_container.appendChild(card);
    }


    function randomise_weapon() {
        let selected_weapon_list = [];

        for (let i = 0; i < weapon_card_list.length; i++) {
            let id = weapon_card_list[i].dataset.id;
            let selected = weapon_card_list[i].dataset.selected;

            if (selected == "true") {
                selected_weapon_list.push(id);
            }
        }


        if (selected_weapon_list.length > 0) {
            let i = Math.floor(Math.random() * selected_weapon_list.length);
            let weapon_obj = weapon_list[selected_weapon_list[i]];
            weapon_name.innerHTML = weapon_obj.name;
            if (weapon_img.firstElementChild) {
                weapon_img.removeChild(weapon_img.firstElementChild);
            }
            weapon_img.appendChild(weapon_obj.img_obj);

            let sub_obj = sub_list[weapon_obj.sub];
            sub_name.innerHTML = sub_obj.name;
            if (sub_img.firstElementChild) {
                sub_img.removeChild(sub_img.firstElementChild);
            }
            sub_img.appendChild(sub_obj.img_obj);

            let special_obj = special_list[weapon_obj.special];
            special_name.innerHTML = special_obj.name;
            if (special_img.firstElementChild) {
                special_img.removeChild(special_img.firstElementChild);
            }
            special_img.appendChild(special_obj.img_obj);

            let class_obj = class_list[weapon_obj.class];
            stat_name_1.innerHTML = class_obj.stat_name[0];
            stat_name_2.innerHTML = class_obj.stat_name[1];
            stat_name_3.innerHTML = class_obj.stat_name[2];

            stat_val_1.style.width = weapon_obj.stats[0] + "%";
            stat_val_2.style.width = weapon_obj.stats[1] + "%";
            stat_val_3.style.width = weapon_obj.stats[2] + "%";

            special_points.innerHTML = weapon_obj.points + "p";
        } else {
            console.log("Error: No weapons to choose from");
        }
    }

    function close_side_menu() {
        side_menu.classList.remove("open");
        side_menu.setAttribute("inert", "");
        main_shell.removeAttribute("inert");
        weapon_select_btn.removeAttribute("inert");
    }


    // display random weapon
    randomise_btn.addEventListener("click", function () {
        randomise_weapon();
    });

    // open weapon select side menu
    weapon_select_btn.addEventListener("click", function () {
        side_menu.classList.add("open");
        side_menu.removeAttribute("inert");
        main_shell.setAttribute("inert", "");
        weapon_select_btn.setAttribute("inert", "");
    });

    // close side menu
    side_menu_close.addEventListener("click", function () {
        close_side_menu();
    });

    side_menu_background.addEventListener("click", function () {
        close_side_menu();
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            close_side_menu();
        }
    });
});