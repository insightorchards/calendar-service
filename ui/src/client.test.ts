import {
  getEntries,
  getEntry,
  createEntry,
  updateEntry,
  deleteEntry,
} from "./client";

describe("client functions", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  describe("getEntries", () => {
    it("succeeds", async () => {
      const mockResponse = {
        status: 200,
        json: () => {
          return [
            {
              _id: "638d815856e5c70955565b7e",
              eventId: "5678",
              creatorId: "1234",
              title: "Ange's Bat Mitzvah",
              description: "Ange is turning 13!",
              allDay: false,
              recurring: false,
              startTimeUtc: "2024-06-06T01:07:00.000Z",
              endTimeUtc: "2024-06-06T05:07:00.000Z",
              createdAt: "2022-12-05T05:27:52.212Z",
              updatedAt: "2022-12-05T05:27:52.212Z",
              __v: 0,
            },
          ] as any;
        },
      } as Response;

      const fetchSpy = jest
        .spyOn(window, "fetch")
        .mockResolvedValue(mockResponse);

      const result = await getEntries();
      expect(fetchSpy).toHaveBeenCalled();
      expect(result).toEqual([
        {
          _id: "638d815856e5c70955565b7e",
          allDay: false,
          end: "2024-06-06T05:07:00.000Z",
          start: "2024-06-06T01:07:00.000Z",
          title: "Ange's Bat Mitzvah",
        },
      ]);
    });

    it("throws an error on failure", () => {
      const mockResponse = {
        status: 400,
        json: () => {
          return [{}] as any;
        },
      } as Response;

      jest.spyOn(window, "fetch").mockResolvedValue(mockResponse);
      expect(() => getEntries()).rejects.toThrowError(
        new Error("Get entries request failed")
      );
    });
  });

  describe("getEntry", () => {
    it("succeeds", async () => {
      const mockResponse = {
        status: 200,
        json: () => {
          return {
            _id: "638d815856e5c70955565b7e",
            eventId: "5678",
            creatorId: "1234",
            title: "Ange's Bat Mitzvah",
            description: "Ange is turning 13!",
            allDay: false,
            recurring: false,
            startTimeUtc: "2024-06-06T01:07:00.000Z",
            endTimeUtc: "2024-06-06T05:07:00.000Z",
            createdAt: "2022-12-05T05:27:52.212Z",
            updatedAt: "2022-12-05T05:27:52.212Z",
            __v: 0,
          } as any;
        },
      } as Response;

      const fetchSpy = jest
        .spyOn(window, "fetch")
        .mockResolvedValue(mockResponse);

      const result = await getEntry("638d815856e5c70955565b7e");
      expect(fetchSpy).toHaveBeenCalled();
      expect(result).toEqual({
        _id: "638d815856e5c70955565b7e",
        eventId: "5678",
        creatorId: "1234",
        title: "Ange's Bat Mitzvah",
        description: "Ange is turning 13!",
        allDay: false,
        recurring: false,
        startTimeUtc: "2024-06-06T01:07:00.000Z",
        endTimeUtc: "2024-06-06T05:07:00.000Z",
        createdAt: "2022-12-05T05:27:52.212Z",
        updatedAt: "2022-12-05T05:27:52.212Z",
        __v: 0,
      });
    });

    it("throws an error on failure", () => {
      const mockResponse = {
        status: 400,
        json: () => {
          return [{}] as any;
        },
      } as Response;

      jest.spyOn(window, "fetch").mockResolvedValue(mockResponse);
      expect(() => getEntry("638d815856e5c70955565b7e")).rejects.toThrowError(
        new Error("Get entry request failed")
      );
    });
  });

  describe("createEntry", () => {
    it("succeeds", async () => {
      const mockResponse = {
        status: 200,
        json: () => {
          return {
            _id: "638d815856e5c70955565b7e",
            eventId: "5678",
            creatorId: "1234",
            title: "Ange's Bat Mitzvah",
            description: "Ange is turning 13!",
            allDay: false,
            recurring: false,
            startTimeUtc: "2024-06-06T01:07:00.000Z",
            endTimeUtc: "2024-06-06T05:07:00.000Z",
            createdAt: "2022-12-05T05:27:52.212Z",
            updatedAt: "2022-12-05T05:27:52.212Z",
            __v: 0,
          } as any;
        },
      } as Response;

      const fetchSpy = jest
        .spyOn(window, "fetch")
        .mockResolvedValue(mockResponse);

      const result = await createEntry({
        title: "Ange's Bat Mitzvah",
        description: "Ange is turning 13!",
        startTimeUtc: new Date("2024-06-06T01:07:00.000Z"),
        endTimeUtc: new Date("2024-06-06T01:07:00.000Z"),
        allDay: true,
        recurring: false,
      });
      expect(fetchSpy).toHaveBeenCalled();
      expect(result).toEqual({
        _id: "638d815856e5c70955565b7e",
        eventId: "5678",
        creatorId: "1234",
        title: "Ange's Bat Mitzvah",
        description: "Ange is turning 13!",
        allDay: false,
        recurring: false,
        startTimeUtc: "2024-06-06T01:07:00.000Z",
        endTimeUtc: "2024-06-06T05:07:00.000Z",
        createdAt: "2022-12-05T05:27:52.212Z",
        updatedAt: "2022-12-05T05:27:52.212Z",
        __v: 0,
      });
    });

    it("succeeds for recurring events", async () => {
      const mockResponse = {
        status: 200,
        json: () => {
          return {
            _id: "638d815856e5c70955565b7e",
            eventId: "5678",
            creatorId: "1234",
            title: "Ange's Bat Mitzvah",
            description: "Ange is turning 13!",
            allDay: false,
            recurring: true,
            recurrenceBegins: "2024-06-06T01:07:00.000Z",
            recurrenceEnds: "2025-06-06T01:07:00.000Z",
            startTimeUtc: "2024-06-06T01:07:00.000Z",
            endTimeUtc: "2024-06-06T05:07:00.000Z",
            createdAt: "2022-12-05T05:27:52.212Z",
            updatedAt: "2022-12-05T05:27:52.212Z",
            __v: 0,
          } as any;
        },
      } as Response;

      const fetchSpy = jest
        .spyOn(window, "fetch")
        .mockResolvedValue(mockResponse);

      const result = await createEntry({
        title: "Ange's Bat Mitzvah",
        description: "Ange is turning 13!",
        startTimeUtc: new Date("2024-06-06T01:07:00.000Z"),
        endTimeUtc: new Date("2024-06-06T01:07:00.000Z"),
        allDay: true,
        recurring: true,
        frequency: "monthly",
        recurrenceBegins: new Date("2024-06-06T01:07:00.000Z"),
        recurrenceEnds: new Date("2025-06-06T01:07:00.000Z"),
      });
      expect(fetchSpy).toHaveBeenCalled();
      expect(result).toEqual({
        _id: "638d815856e5c70955565b7e",
        eventId: "5678",
        creatorId: "1234",
        title: "Ange's Bat Mitzvah",
        description: "Ange is turning 13!",
        allDay: false,
        recurring: true,
        recurrenceBegins: "2024-06-06T01:07:00.000Z",
        recurrenceEnds: "2025-06-06T01:07:00.000Z",
        startTimeUtc: "2024-06-06T01:07:00.000Z",
        endTimeUtc: "2024-06-06T05:07:00.000Z",
        createdAt: "2022-12-05T05:27:52.212Z",
        updatedAt: "2022-12-05T05:27:52.212Z",
        __v: 0,
      });
    });

    it("throws an error on failure", () => {
      const mockResponse = {
        status: 400,
        json: () => {
          return [{}] as any;
        },
      } as Response;

      jest.spyOn(window, "fetch").mockResolvedValue(mockResponse);
      expect(() =>
        createEntry({
          title: "Ange's Bat Mitzvah",
          description: "Ange is turning 13!",
          startTimeUtc: new Date("2024-06-06T01:07:00.000Z"),
          endTimeUtc: new Date("2024-06-06T01:07:00.000Z"),
          allDay: true,
          recurring: false,
        })
      ).rejects.toThrowError(new Error("Create entry request failed"));
    });
  });

  describe("updateEntry", () => {
    it("succeeds", async () => {
      const mockResponse = {
        status: 200,
        json: () => {
          return {
            _id: "638d815856e5c70955565b7e",
            eventId: "5678",
            creatorId: "1234",
            title: "Barbies's Bat Mitzvah",
            description: "Barbie is turning 13!",
            allDay: false,
            recurring: false,
            startTimeUtc: "2024-06-06T01:07:00.000Z",
            endTimeUtc: "2024-06-06T05:07:00.000Z",
            createdAt: "2022-12-05T05:27:52.212Z",
            updatedAt: "2022-12-05T05:27:52.212Z",
            __v: 0,
          } as any;
        },
      } as Response;

      const fetchSpy = jest
        .spyOn(window, "fetch")
        .mockResolvedValue(mockResponse);

      const result = await updateEntry("638d815856e5c70955565b7e", {
        title: "Barbies's Bat Mitzvah",
        description: "Barbie is turning 13!",
        startTimeUtc: new Date("2024-06-06T01:07:00.000Z"),
        endTimeUtc: new Date("2024-06-06T01:07:00.000Z"),
        allDay: true,
        recurring: false,
      });
      expect(fetchSpy).toHaveBeenCalled();
      expect(fetchSpy.mock.calls[0][1]).toEqual(
        expect.objectContaining({ method: "PATCH" })
      );

      expect(result).toEqual({
        _id: "638d815856e5c70955565b7e",
        eventId: "5678",
        creatorId: "1234",
        title: "Barbies's Bat Mitzvah",
        description: "Barbie is turning 13!",
        allDay: false,
        recurring: false,
        startTimeUtc: "2024-06-06T01:07:00.000Z",
        endTimeUtc: "2024-06-06T05:07:00.000Z",
        createdAt: "2022-12-05T05:27:52.212Z",
        updatedAt: "2022-12-05T05:27:52.212Z",
        __v: 0,
      });
    });

    it("succeeds for recurring events", async () => {
      const mockResponse = {
        status: 200,
        json: () => {
          return {
            _id: "638d815856e5c70955565b7e",
            eventId: "5678",
            creatorId: "1234",
            title: "Barbies's Bat Mitzvah",
            description: "Barbie is turning 13!",
            allDay: false,
            recurring: true,
            recurrenceBegins: "2024-06-06T01:07:00.000Z",
            recurrenceEnds: "2025-06-06T01:07:00.000Z",
            startTimeUtc: "2024-06-06T01:07:00.000Z",
            endTimeUtc: "2024-06-06T05:07:00.000Z",
            createdAt: "2022-12-05T05:27:52.212Z",
            updatedAt: "2022-12-05T05:27:52.212Z",
            __v: 0,
          } as any;
        },
      } as Response;

      const fetchSpy = jest
        .spyOn(window, "fetch")
        .mockResolvedValue(mockResponse);

      const result = await updateEntry("638d815856e5c70955565b7e", {
        title: "Barbies's Bat Mitzvah",
        description: "Barbie is turning 13!",
        startTimeUtc: new Date("2024-06-06T01:07:00.000Z"),
        endTimeUtc: new Date("2024-06-06T01:07:00.000Z"),
        allDay: true,
        recurring: true,
        frequency: "monthly",
        recurrenceBegins: new Date("2024-06-06T01:07:00.000Z"),
        recurrenceEnds: new Date("2025-06-06T01:07:00.000Z"),
      });
      expect(fetchSpy).toHaveBeenCalled();
      expect(result).toEqual({
        _id: "638d815856e5c70955565b7e",
        eventId: "5678",
        creatorId: "1234",
        title: "Barbies's Bat Mitzvah",
        description: "Barbie is turning 13!",
        allDay: false,
        recurring: true,
        recurrenceBegins: "2024-06-06T01:07:00.000Z",
        recurrenceEnds: "2025-06-06T01:07:00.000Z",
        startTimeUtc: "2024-06-06T01:07:00.000Z",
        endTimeUtc: "2024-06-06T05:07:00.000Z",
        createdAt: "2022-12-05T05:27:52.212Z",
        updatedAt: "2022-12-05T05:27:52.212Z",
        __v: 0,
      });
    });

    it("throws an error on failure", async () => {
      const mockResponse = {
        status: 400,
        json: () => {
          return {} as any;
        },
      } as Response;

      jest.spyOn(window, "fetch").mockResolvedValue(mockResponse);

      expect(() =>
        updateEntry("638d815856e5c70955565b7e", {
          title: "Barbies's Bat Mitzvah",
          description: "Barbie is turning 13!",
          startTimeUtc: new Date("2024-06-06T01:07:00.000Z"),
          endTimeUtc: new Date("2024-06-06T01:07:00.000Z"),
          allDay: true,
          recurring: false,
        })
      ).rejects.toThrow(new Error("Update entry request failed"));
    });
  });

  describe("deleteEntry", () => {
    it("succeeds", async () => {
      const mockResponse = {
        status: 200,
      } as Response;

      const fetchSpy = jest
        .spyOn(window, "fetch")
        .mockResolvedValue(mockResponse);

      const result = await deleteEntry("638d815856e5c70955565b7e");
      expect(fetchSpy).toHaveBeenCalled();
      expect(fetchSpy.mock.calls[0][1]).toEqual(
        expect.objectContaining({ method: "DELETE" })
      );

      expect(result).toEqual({
        status: 200,
      });
    });

    it("throws an error on failure", async () => {
      const mockResponse = {
        status: 400,
        json: () => {
          return {} as any;
        },
      } as Response;

      jest.spyOn(window, "fetch").mockResolvedValue(mockResponse);

      expect(() => deleteEntry("638d815856e5c70955565b7e")).rejects.toThrow(
        new Error("Delete entry request failed")
      );
    });
  });
});
