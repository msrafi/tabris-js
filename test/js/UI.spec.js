describe("UI", function() {

  var nativeBridge;
  var ui;
  var shellId;

  beforeEach(function() {
    nativeBridge = new NativeBridgeSpy();
    tabris._reset();
    tabris._start(nativeBridge);
    ui = new tabris._UI();
  });

  describe("create", function() {

    beforeEach(function() {
      ui._create();
    });

    it("creates Display, Shell, and tabris UI", function() {
      var createCalls = nativeBridge.calls({op: "create"});
      expect(createCalls[0].type).toBe("rwt.widgets.Display");
      expect(createCalls[1].type).toBe("rwt.widgets.Shell");
      expect(createCalls[2].type).toBe("tabris.UI");
    });

    it("created Shell is active, visible, and maximized", function() {
      var shellCreate = nativeBridge.calls({op: "create", type: "rwt.widgets.Shell"})[0];
      expect(shellCreate.properties.active).toBe(true);
      expect(shellCreate.properties.visibility).toBe(true);
      expect(shellCreate.properties.mode).toBe("maximized");
    });

    it("created tabris UI refers to Shell", function() {
      var shellCreate = nativeBridge.calls({op: "create", type: "rwt.widgets.Shell"})[0];
      var tabrisUiCreate = nativeBridge.calls({op: "create", type: "tabris.UI"})[0];
      expect(tabrisUiCreate.properties.shell).toBe(shellCreate.id);
    });

    it("listens on tabris UI ShowPage and ShowPreviousPage events", function() {
      expect(nativeBridge.calls({op: "listen", id: ui.id, event: "ShowPage"}).length).toBe(1);
      expect(nativeBridge.calls({op: "listen", id: ui.id, event: "ShowPreviousPage"}).length).toBe(1);
    });

  });

  describe("instance", function() {

    beforeEach(function() {
      ui._create();
      tabris.ui = ui;
      shellId = nativeBridge.calls({op: "create", type: "rwt.widgets.Shell"})[0].id;
      nativeBridge.resetCalls();
    });

    afterEach(function() {
      delete tabris.ui;
    });

    describe("when a Close event is received for the Shell", function() {

      beforeEach(function() {
        tabris._notify(shellId, "Close", {});
      });

      it("sends a Shell destroy", function() {
        // See https://github.com/eclipsesource/tabris-js/issues/28
        expect(nativeBridge.calls({id: shellId, op: "destroy"}).length).toBe(1);
      });

    });

    describe("with a page", function() {

      var page;

      beforeEach(function() {
        page = tabris.create("Page", {title: "Foo"});
        ui.set("activePage", page);
        spyOn(page, "close");
      });

      it("ShowPreviousPage event closes page", function() {
        tabris._notify(ui.id, "ShowPreviousPage", {});
        expect(page.close).toHaveBeenCalled();
      });

      it("ShowPage sets activePage", function() {
        tabris._notify(ui.id, "ShowPage", {pageId: page._page.id});
        var setCall = nativeBridge.calls({op: "set", id: ui.id}).pop();
        expect(setCall.properties.activePage).toBe(page._page.id);
      });

    });

    describe("with multiple pages", function() {

      var page1, page2, page3;

      beforeEach(function() {
        page1 = tabris.create("Page", {title: "Page 1"});
        page2 = tabris.create("Page", {title: "Page 2"});
        page3 = tabris.create("Page", {title: "Page 3"});
      });

      it("setting 'activePage' ignores widgets other than Page", function() {
        ui.set("activePage", tabris.create("Button"));
        expect(nativeBridge.calls({op: "set", id: ui.id}).length).toBe(0);
      });

      it("setting 'activePage' triggers 'appear' and 'disappear' events on pages", function() {
        ui.set("activePage", page1);
        spyOn(page1, "trigger");
        spyOn(page2, "trigger");

        ui.set("activePage", page2);

        expect(page1.trigger).toHaveBeenCalledWith("disappear");
        expect(page2.trigger).toHaveBeenCalledWith("appear");
      });

      it("setting 'activePage' issues a set operation", function() {
        ui.set("activePage", page1);
        var setCall = nativeBridge.calls({op: "set", id: ui.id}).pop();
        expect(setCall.properties.activePage).toBe(page1._page.id);
      });

      it("setting 'activePage' to current active page does not issue a set operation", function() {
        ui.set("activePage", page1);
        nativeBridge.resetCalls();

        ui.set("activePage", page1);

        expect(nativeBridge.calls({op: "set", id: ui.id}).length).toBe(0);
      });

      it("getting 'activePage' returns last set active page", function() {
        ui.set("activePage", page1);
        ui.set("activePage", page2);
        expect(ui.get("activePage")).toBe(page2);
      });

      it("when active page is closed, restores last active page", function() {
        ui.set("activePage", page1);
        ui.set("activePage", page2);
        ui.set("activePage", page3);

        page3.close();

        var lastSetCall = nativeBridge.calls({op: "set", id: ui.id}).pop();
        expect(lastSetCall.properties.activePage).toBe(page2._page.id);
        expect(ui.get("activePage")).toBe(page2);
      });

      it("when active page is closed, triggers 'appear' and 'disappear' events on pages", function() {
        ui.set("activePage", page1);
        ui.set("activePage", page2);
        spyOn(page1, "trigger").and.callThrough();
        spyOn(page2, "trigger").and.callThrough();

        page2.close();

        expect(page2.trigger).toHaveBeenCalledWith("disappear");
        expect(page1.trigger).toHaveBeenCalledWith("appear");
      });

      it("when non active page is closed, it won't be restored later on", function() {
        ui.set("activePage", page1);
        ui.set("activePage", page2);
        ui.set("activePage", page3);

        page2.close();
        page3.close();

        var lastSetCall = nativeBridge.calls({op: "set", id: ui.id}).pop();
        expect(lastSetCall.properties.activePage).toBe(page1._page.id);
        expect(ui.get("activePage")).toBe(page1);
      });

    });

    it("ShowPreviousPage does not fail without a page", function() {
      tabris._notify(ui.id, "ShowPreviousPage", {});
    });

  });

});
