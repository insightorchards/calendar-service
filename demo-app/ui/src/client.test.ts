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
              recurring: true,
              seriesStart: "2024-05-06T01:07:00.000Z",
              startTimeUtc: "2024-06-06T01:07:00.000Z",
              endTimeUtc: "2024-06-06T05:07:00.000Z",
              recurrenceEndsUtc: "2024-06-06T05:07:00.000Z",
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

      const start = "2023-01-01T08:00:00.000Z";
      const end = "2023-02-12T08:00:00.000Z";
      const result = await getEntries(start, end);
      expect(fetchSpy).toHaveBeenCalled();
      expect(result).toEqual([
        {
          _id: "638d815856e5c70955565b7e",
          allDay: false,
          recurring: true,
          end: "2024-06-06T05:07:00.000Z",
          start: "2024-06-06T01:07:00.000Z",
          recurrenceEnd: "2024-06-06T05:07:00.000Z",
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

      const start = "2023-01-01T08:00:00.000Z";
      const end = "2023-02-12T08:00:00.000Z";
      expect(() => getEntries(start, end)).rejects.toThrowError(
        new Error("Get entries request failed"),
      );
    });
  });

  describe("getEntry", () => {
    it("succeeds", async () => {
      const startTime = "2024-06-06T01:07:00.000Z";
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
            startTimeUtc: startTime,
            seriesStart: "2024-05-06T01:07:00.000Z",
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

      const result = await getEntry("638d815856e5c70955565b7e", startTime);
      expect(fetchSpy).toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({
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
      }));
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
        new Error("Get entry request failed"),
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
            recurrenceEndsUtc: "2025-06-06T01:07:00.000Z",
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
        recurrenceEndUtc: new Date("2025-06-06T01:07:00.000Z"),
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
        recurrenceEndsUtc: "2025-06-06T01:07:00.000Z",
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
        }),
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
        expect.objectContaining({ method: "PATCH" }),
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
            recurrenceEndsUtc: "2025-06-06T01:07:00.000Z",
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

      const result = await updateEntry(
        "638d815856e5c70955565b7e",
        {
          title: "Barbies's Bat Mitzvah",
          description: "Barbie is turning 13!",
          startTimeUtc: new Date("2024-06-06T01:07:00.000Z"),
          endTimeUtc: new Date("2024-06-06T01:07:00.000Z"),
          allDay: true,
          recurring: true,
          frequency: "monthly",
          recurrenceEndUtc: new Date("2025-06-06T01:07:00.000Z"),
        },
        "2024-06-06T01:07:00.000Z",
        true,
      );
      expect(fetchSpy).toHaveBeenCalled();
      expect(result).toEqual({
        _id: "638d815856e5c70955565b7e",
        eventId: "5678",
        creatorId: "1234",
        title: "Barbies's Bat Mitzvah",
        description: "Barbie is turning 13!",
        allDay: false,
        recurring: true,
        recurrenceEndsUtc: "2025-06-06T01:07:00.000Z",
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
        }),
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
        expect.objectContaining({ method: "DELETE" }),
      );

      expect(result).toEqual({
        status: 200,
      });
    });

    it("succeeds for recurring events", async () => {
      const mockResponse = {
        status: 200,
      } as Response;

      const startTime = "2024-06-06T01:07:00.000Z";

      const fetchSpy = jest
        .spyOn(window, "fetch")
        .mockResolvedValue(mockResponse);

      const result = await deleteEntry(
        "638d815856e5c70955565b7e",
        startTime,
        false,
      );
      expect(fetchSpy).toHaveBeenCalled();
      expect(fetchSpy.mock.calls[0][1]).toEqual(
        expect.objectContaining({ method: "DELETE" }),
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
        new Error("Delete entry request failed"),
      );
    });
  });
});
