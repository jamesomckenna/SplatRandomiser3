window.addEventListener("load", (event) => {
    console.log("Page Loaded");

    let main_shell = document.getElementById('main_shell');
    let randomise_btn = document.getElementById('randomise_btn');
    let weapon_name = document.getElementById('weapon_name');
    let weapon_img = document.getElementById('weapon_img');
    let sub_name = document.getElementById('sub_name');
    let sub_img = document.getElementById('sub_img');
    let special_name = document.getElementById('special_name');
    let special_img = document.getElementById('special_img');
    let special_points = document.getElementById('special_points');
    let stat_name_1 = document.getElementById('stat_name_1');
    let stat_name_2 = document.getElementById('stat_name_2');
    let stat_name_3 = document.getElementById('stat_name_3');
    let stat_val_1 = document.getElementById('stat_val_1');
    let stat_val_2 = document.getElementById('stat_val_2');
    let stat_val_3 = document.getElementById('stat_val_3');

    let loading_screen = document.getElementById('loading_screen');
    let loading_bar = document.getElementById('loading_bar');
    let loading_value = document.getElementById('loading_value');

    let side_menu_content = document.getElementById('side_menu_content');
    let weapon_select_btn = document.getElementById('weapon_select_btn');
    let side_menu_close = document.getElementById('side_menu_close');
    let weapon_select_container = document.getElementById('weapon_select_container');
    let weapon_card_list = document.getElementsByClassName("weapon_card_weapon");
    let weapon_card_class_list = document.getElementsByClassName("weapon_card_class");

    let weapon_list, sub_list, special_list, class_list;
    let data_promises = [];
    let img_promises = [];

    // check if webp is supported
    let image_type = 'png';
    let temp_canvas = document.createElement('canvas');
    if (!!(temp_canvas.getContext && temp_canvas.getContext('2d'))) {
        if (temp_canvas.toDataURL('image/webp').indexOf('data:image/webp') == 0) {
            image_type = 'webp';
        }
    }

    data_promises.push(fetch('src/json/weapons.json')
        .then((response) => response.json())
        .then((json) => weapon_list = json));

    data_promises.push(fetch('src/json/subs.json')
        .then((response) => response.json())
        .then((json) => sub_list = json));

    data_promises.push(fetch('src/json/specials.json')
        .then((response) => response.json())
        .then((json) => special_list = json));

    data_promises.push(fetch('src/json/classes.json')
        .then((response) => response.json())
        .then((json) => class_list = json));

    Promise.all(data_promises).then(d => {
        console.log('Data Loaded');

        let load_img_progress = 0;
        let load_img_total = weapon_list.length + Object.keys(sub_list).length + Object.keys(special_list).length + Object.keys(class_list).length;

        for (key in class_list) {
            class_list[key].img_obj = new Image(90, 90);
            class_list[key].img_obj.alt = class_list[key].name;
            class_list[key].img_obj.src = 'src/img/' + image_type + '/class/' + class_list[key].img + '.' + image_type;

            img_promises.push(class_list[key].img_obj.decode()
                .then(() => {
                    update_load_screen();
                }));
        }
 
        weapon_list.sort(sort_weapons_alphabetically);
        weapon_list.forEach((element, index) => {
            let img_src = 'src/img/' + image_type + '/weapons/' + element.img + '.' + image_type;
            weapon_list[index].img_obj = new Image(205, 205);
            weapon_list[index].img_obj.alt = element.name;
            weapon_list[index].img_obj.src = img_src;

            img_promises.push(weapon_list[index].img_obj.decode()
                .then(() => {
                    update_load_screen();
                }));
        });

        for (key in sub_list) {
            sub_list[key].img_obj = new Image(71, 71);
            sub_list[key].img_obj.alt = sub_list[key].name;
            sub_list[key].img_obj.src = 'src/img/' + image_type + '/sub/' + sub_list[key].img + '.' + image_type;

            img_promises.push(sub_list[key].img_obj.decode()
                .then(() => {
                    update_load_screen();
                }));
        }

        for (key in special_list) {
            special_list[key].img_obj = new Image(71, 71);
            special_list[key].img_obj.alt = special_list[key].name;
            special_list[key].img_obj.src = 'src/img/' + image_type + '/special/' + special_list[key].img + '.' + image_type;

            img_promises.push(special_list[key].img_obj.decode()
                .then(() => {
                    update_load_screen();
                }));
        }

        Promise.all(img_promises).then(d => {
            console.log('Images Loaded');

            //add weapon checkbox
            for (key in class_list) {
                class_list[key].container = add_weapon_class_group(key, class_list[key].name, class_list[key].img_obj);
            };

            //add weapon checkbox
            weapon_list.forEach((element, index) => {
                add_weapon_checkbox(index, element.name, weapon_list[index].img_obj.src, class_list[weapon_list[index].class].container);
            });

            // init toggle functions for cards
            for (let i = 0; i < weapon_card_list.length; i++) {
                weapon_card_list[i].addEventListener('click', function () {
                    if (this.dataset.selected == 'true') {
                        this.dataset.selected = 'false'
                    } else {
                        this.dataset.selected = 'true';
                    }
                });
            }

            for (let i = 0; i < weapon_card_class_list.length; i++) {
                weapon_card_class_list[i].addEventListener("click", function () {
                    let toggle = '';
                    if (this.dataset.selected == 'true') {
                        this.dataset.selected = 'false';
                        toggle = 'OFF'
                    } else {
                        this.dataset.selected = 'true';
                        toggle = 'ON'
                    }
                    this.children[1].innerHTML = 'ALL <br>'+ this.dataset.class.toUpperCase() +'<br>' + toggle;

                    let class_group = this.dataset.class;
                    let selected = this.dataset.selected;

                    for (let j = 0; j < weapon_card_list.length; j++) {
                        if (weapon_list[weapon_card_list[j].dataset.id].class == class_group || class_group == 'weapons') {
                            weapon_card_list[j].dataset.selected = selected;
                        } 
                    }

                    if(class_group == 'weapons'){
                        for (let j = 0; j < weapon_card_class_list.length; j++) {
                            weapon_card_class_list[j].dataset.selected = selected;
                            weapon_card_class_list[j].children[1].innerHTML = 'ALL <br>'+ this.dataset.class.toUpperCase() +'<br>' + toggle;
                        }
                    }
                });
            }

            randomise_weapon();
            randomise_btn.disabled = false;
            loading_screen.style.display = 'none';
        });

        function update_load_screen() {
            load_img_progress++;
            let progress = Math.floor((load_img_progress / load_img_total) * 100) + '%';
            loading_bar.style.width = progress;
            loading_value.innerHTML = progress;
        }
    }).catch(e => {
        console.log('Error: Unable to obtain data', e);
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
        let shell = document.createElement("div");
        let card = document.createElement("div");
        let name = document.createElement("div");

        card_container.classList.add("weapon_card_container");
        card_container.dataset.class = class_id;
        card_container.dataset.selected = 'true';
        shell.classList.add("weapon_card_shell");
        card.classList.add("weapon_card");
        card.classList.add("weapon_card_class");
        card.dataset.selected = 'true';
        card.dataset.class = class_id;
        class_img_obj.classList.add("weapon_card_img");
        name.classList.add("weapon_card_name");
        name.innerHTML = 'ALL<br>'+class_name.toUpperCase() + '<br>ON'

        card.appendChild(class_img_obj);
        card.appendChild(name);
        shell.appendChild(card);
        card_container.appendChild(shell);
        weapon_select_container.appendChild(card_container);
        return card_container;
    }

    function add_weapon_checkbox(weapon_index, weapon_name, weapon_img_url, card_container) {
        let shell = document.createElement("div");
        let card = document.createElement("div");
        let img = new Image(50, 50);
        let name = document.createElement("div");

        shell.classList.add("weapon_card_shell");
        card.classList.add("weapon_card");
        card.classList.add("weapon_card_weapon");
        card.dataset.selected = 'true';
        card.dataset.id = weapon_index;
        img.alt = weapon_name;
        img.src = weapon_img_url;
        img.classList.add("weapon_card_img");
        name.classList.add("weapon_card_name");

        name.innerHTML = weapon_name;
        card.appendChild(img);
        card.appendChild(name);
        shell.appendChild(card);
        card_container.appendChild(shell);
    }


    function randomise_weapon() {
        let selected_weapon_list = [];

        for (let i = 0; i < weapon_card_list.length; i++) {
            let id = weapon_card_list[i].dataset.id;
            let selected = weapon_card_list[i].dataset.selected;

            if (selected == 'true') {
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

            stat_val_1.style.width = weapon_obj.stats[0] + '%';
            stat_val_2.style.width = weapon_obj.stats[1] + '%';
            stat_val_3.style.width = weapon_obj.stats[2] + '%';

            special_points.innerHTML = weapon_obj.points + 'p';
        } else {
            console.log('Error: No weapons to choose from');
        }
    }

    function close_side_menu() {
        side_menu_content.classList.remove("open");
    }


    // display random weapon
    randomise_btn.addEventListener("click", function () {
        randomise_weapon();
    });

    // open weapon select side menu
    weapon_select_btn.addEventListener("click", function () {
        side_menu_content.classList.add("open");
    });

    // close side menu
    side_menu_close.addEventListener("click", function () {
        close_side_menu();
    });

    main_shell.addEventListener("click", function () {
        close_side_menu();
    });

});